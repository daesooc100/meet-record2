import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// AI Studio Nginx reverse proxy listens on 8080 and proxies to port 3000
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// API endpoint to extract tasks from meeting notes
app.post('/api/extract-tasks', async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
      return res.status(400).json({
        error: '회의록 내용을 입력해주세요.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. AI Studio Secrets 설정을 확인해주세요.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `당신은 회의록에서 업무 액션 아이템(할 일)을 정확하게 추출하는 전문 비서입니다.
주어진 회의록을 면밀히 분석하여, 누군가가 실제로 해야 할 일(Action Items)만 뽑아내어 지정된 JSON 형식으로 응답하세요.

[추출 규칙 - 반드시 준수]
1. 누군가 수행해야 할 업무나 실행 과제만 추출합니다. 단순 정보 공유, 과거 현황 보고, 단순 의견 제시는 제외합니다.
2. 각 할 일 객체 필드 규칙:
   - task: 수행해야 할 명확하고 실행 가능한 할 일 내용 (예: "신규 결제 모듈 연동 테스트 진행")
   - assignee: 담당자 이름 또는 호칭.
     * 담당자가 2명 이상 여러 명이면 반드시 '전원'으로 작성합니다.
     * 담당자가 명시되지 않았거나 누구인지 알 수 없으면 반드시 '미정'으로 작성합니다.
     * 한 명일 경우 그 사람의 이름/직함을 정확히 기재합니다 (예: "김민수 팀장", "이지은").
   - dueDate: 기한.
     * 회의록에 언급된 마감 일정 또는 기한을 적습니다 (예: "이번 주 금요일까지", "11월 15일 18시", "다음 주 화요일").
     * [가장 중요] 회의록 본문에 날짜나 기한 언급이 전혀 없다면 절대로 임의로 날짜를 상상하여 지어내지 말고, 반드시 '미정'으로 작성합니다.
   - sourceSentence: 회의록 근거 문장.
     * [가장 중요] 해당 할 일이 도출된 회의록 본문의 문장을 오탈자, 띄어쓰기 포함하여 글자 그대로 원문 100% 복사해서 옮깁니다. 요약하거나 수정하지 마세요.
3. 회의록 내에 실행해야 할 일이 없거나 관련 내용이 없는 경우 빈 배열 []을 반환하세요.`;

    // Function to generate with retry and model fallback if high demand
    async function callGeminiWithRetry() {
      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      let lastError: any = null;

      for (const model of modelsToTry) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const resp = await ai.models.generateContent({
              model,
              contents: `다음 회의록을 분석하여 할 일 목록을 추출해주세요:\n\n${notes.trim()}`,
              config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.ARRAY,
                  description: '회의록에서 추출된 할 일 항목 목록',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      task: {
                        type: Type.STRING,
                        description: '수행해야 할 구체적인 할 일 내용',
                      },
                      assignee: {
                        type: Type.STRING,
                        description: "담당자 (복수면 '전원', 없으면 '미정')",
                      },
                      dueDate: {
                        type: Type.STRING,
                        description: "기한 (회의록에 없는 날짜는 지어내지 말고 '미정')",
                      },
                      sourceSentence: {
                        type: Type.STRING,
                        description: '회의록 글자 그대로 옮긴 근거 문장',
                      },
                    },
                    required: ['task', 'assignee', 'dueDate', 'sourceSentence'],
                  },
                },
              },
            });
            return resp;
          } catch (err: any) {
            lastError = err;
            console.warn(`Attempt ${attempt} on model ${model} failed:`, err?.message || err);
            // Wait briefly before retry
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
      throw lastError;
    }

    const response = await callGeminiWithRetry();

    const rawText = response.text || '[]';
    let parsedTasks = [];
    try {
      parsedTasks = JSON.parse(rawText);
      if (!Array.isArray(parsedTasks)) {
        parsedTasks = [];
      }
    } catch {
      console.error('Failed to parse Gemini JSON output:', rawText);
      return res.status(500).json({
        error: 'AI 응답 데이터를 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    }

    return res.json({
      success: true,
      tasks: parsedTasks,
    });
  } catch (error: any) {
    console.error('Task extraction error:', error);
    const errorMessage = error?.message || '할 일 추출 중 오류가 발생했습니다.';
    return res.status(500).json({
      error: errorMessage,
    });
  }
});

// Setup dev server with Vite or static serving in production
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath);
  const isProduction = process.env.NODE_ENV === 'production' || hasDist;

  if (isProduction && hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
