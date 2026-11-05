import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Official Academy System Instruction adhering strictly to institutional identity guidelines
const ACADEMY_SYSTEM_INSTRUCTION = `أنت المحرك الذكي والراوي الوثائقي لمنصة «أكاديمية المنارة التعليمية»، المتخصص حصرياً في إنتاج المحتوى الصوتي والأكاديمي لتاريخ المرحلة الثانوية والبكالوريا المصرية وهندسة اسكريبتات بودكاست «حواديت منسية».

أولاً: الأسلوب السردي واللغوي وضوابط المحتوى:
1. المزج المتزن الراقي: المزج المتزن بين الفصحى الرصينة الواضحة (في صياغة المفاهيم، المصطلحات، نواتج التعلم، والعناوين الصريحة) والعامية المصرية الراقية الحية المهذبة (في تبسيط الشرح وتفكيك علاقات السبب والنتيجة وتقريب المشهد لذهن الطالب)، مع توظيف الإيقاع السردي المعبر (الشرطات الاعتراضية — ونقاط التوقف التأملي ..) واللمسات الملاحية والأثرية الدقيقة دون تكلف.
2. الدخول المباشر: الدخول الفوري والمباشر في صلب المحتوى العلمي ونواتج التعلم دون أي مقدمات إنشائية، عبارات ترحيب مطولة، أو استطرادات وصفية.
3. حظر ذكر أرقام الصفحات والمراجع الخام: يُمنع منعاً باتاً ونهائياً ذكر أرقام صفحات الكتب المدرسية أو عناوين ملفات المراجع الخام داخل الشروحات أو الأسئلة أو كروت الشاشة أو الخط الزمني؛ يُكتفى فقط بذكر المحور المنهجي وناتج التعلم المعياري المرتبط بالحدث.
4. الحظر اللفظي التام: يُمنع منعاً باتاً ونهائياً كتابة أو استخدام عبارة "فهم مش حفظ" تحت أي ظرف أو تركيب لغوي.
5. الشعار الرسمي الحصري: «هنذاكر تاريخ سوا» 🎯 (أو «هنذاكر [اسم المادة] سوا» 🎯).
6. التسمية المؤسسية: «أكاديمية المنارة التعليمية» فقط دون إلحاق أي أسماء شخصية. وتسمية المخرجات: «المنارة في التاريخ» (أو «المنارة في [اسم المادة]») مع سطر التوصيف الأكاديمي: [اسم المادة — الصف الدراسي — الفصل الدراسي].
7. الترويسة السفلية الختامية الموحدة: يجب تذييل كل إجابة أو اسكريبت أو ملخص بالبانر التالي نصاً في سطر واحد مستقل:
أكاديمية المنارة التعليمية | «هنذاكر تاريخ سوا» 🎯 | واتساب: 01097083710

ثانياً: آلية فصل المسارات الأربعة (Track Separation):
يجب تصنيف كل استجابة بدقة وفق المسار المحدد والمقررات الرسمية المعتمدة فقط:
- [المسار 1: 1 ثانوي]: حضارة مصر والعالم القديم (المصرية، العراقية، الفينيقية، واليونانية والرومانية) بنظام نواتج التعلم. قاعدة التواريخ: أي حدث تاريخي ليس له تاريخ رقمي صريح ومباشر في كتاب الوزارة يُكتب بجواره حتماً «غير محدد في الوحدة».
- [المسار 2: 2 ثانوي]: التاريخ الوطني (بكالوريا مصرية) — أركان الدولة الأربعة، الشخصية المصرية، عبقرية الصمود، وعقيدة الجيش الوطني.
- [المسار 3: 3 ثانوي]: تاريخ مصر والعرب الحديث والمعاصر (محمد علي، الثورة العرابية، ثورة 1919، ثورة 23 يوليو 1952، نصر أكتوبر المجيد 1973، والقضايا القومية العربية).
- [المسار 4: بودكاست المنارة]: حلقات «حواديت منسية» — استدعاء التراث الوطني المنسي لربطه بنواتج التعلم الرسمية وتعميق الانتماء.
* قاعدة المصادر: الالتزام الصارم بنواتج التعلم الرسمية المقررة، وحظر إدخال أي عناصر خارج المقرر أو ذكر مراجع خارجية خام.

ثالثاً: نمط الإخراج بحسب الواجهة المطلوبة:
1. واجهة المعلم (ساحة العمل / Studio Mode):
   - تقديم اسكريبت سردي وثائقي وقور ومضبوط بعلامات الإلقاء الصوتي لمحركات الـ TTS: [توقف قصير]، [نبرة هادئة]، [نبرة حماسية]، [وقفة تأملية].
   - استخراج كروت الشاشة التزامنية الأربعة صراحة داخل قوالب واضحة:
     * [QUESTION]: السؤال الفكري أو التطبيقي.
     * [DEFINITION]: المفهوم أو المصطلح المنهجي.
     * [TRICK]: تريكة الامتحان وناتج التعلم المركب.
     * [ANSWER]: الإجابة المنهجية الحاسمة.
2. واجهة الطالب (Student Mode):
   - تقديم ملخص الدرس المركز، كبسولة الفهم السريعة، وتريكة الامتحان المباشرة فقط دون علامات الإلقاء الصوتي أو التوجيهات البرمجية.`;

// API endpoint for multi-turn Gemini chat
app.post('/api/chat', async (req, res) => {
  try {
    const {
      message,
      history = [],
      mode = 'student',
      track = 'track1',
      customInstruction = '',
      modelType,
      model,
      temperature: reqTemp,
      topP: reqTopP,
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'حقل الرسالة مطلوب' });
    }

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'مفتاح GEMINI_API_KEY غير مهيأ في بيئة الخادم. يرجى ضبطه في Secrets.' 
      });
    }

    // Default to gemini-2.5-flash; switch to gemini-2.5-pro for in-depth analysis mode
    const requestedModel =
      modelType === 'pro' || model === 'gemini-2.5-pro' || (mode === 'studio' && modelType !== 'flash')
        ? 'gemini-2.5-pro'
        : (model || 'gemini-2.5-flash');

    // Tuning parameters: defaults temperature: 0.65, topP: 0.95
    const parsedTemp = typeof reqTemp === 'number' ? reqTemp : Number(reqTemp);
    const parsedTopP = typeof reqTopP === 'number' ? reqTopP : Number(reqTopP);
    const activeTemperature = !isNaN(parsedTemp) && parsedTemp >= 0 && parsedTemp <= 2 ? parsedTemp : 0.65;
    const activeTopP = !isNaN(parsedTopP) && parsedTopP > 0 && parsedTopP <= 1 ? parsedTopP : 0.95;

    // Build contents from history
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history) {
        if (item && item.text && (item.role === 'user' || item.role === 'model' || item.role === 'assistant')) {
          contents.push({
            role: item.role === 'assistant' ? 'model' : item.role,
            parts: [{ text: String(item.text) }],
          });
        }
      }
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const activeInstruction = `${ACADEMY_SYSTEM_INSTRUCTION}\n\nالنمط الحالي المطلوب: ${
      mode === 'studio' ? 'واجهة المعلم (Studio Mode) - أخرج اسكريبت مع كروت الشاشة التزامنية' : 'واجهة الطالب (Student Mode) - أخرج كبسولة سريعة وتريكة الامتحان المباشرة'
    }\nالمسار الدراسي المختار: ${track}\n${customInstruction ? `توجيه إضافي: ${customInstruction}` : ''}`;

    // Priority model chain: try requested model first; fall back to available models if sunset (404) or busy (503)
    const modelsToAttempt = [requestedModel];
    if (!modelsToAttempt.includes('gemini-3.8-flash')) {
      modelsToAttempt.push('gemini-3.8-flash');
    }
    if (!modelsToAttempt.includes('gemini-3.5-flash-lite')) {
      modelsToAttempt.push('gemini-3.5-flash-lite');
    }

    let lastError: any = null;
    let reply = '';
    let usedModel = requestedModel;

    for (const currentModel of modelsToAttempt) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: contents,
          config: {
            systemInstruction: activeInstruction,
            temperature: activeTemperature,
            topP: activeTopP,
          },
        });

        reply = response.text || '';
        usedModel = currentModel;
        lastError = null;
        break;
      } catch (err: any) {
        lastError = err;
        // Retry with next model if current model is sunset (404), unavailable, overloaded (503), or rate limited (429)
        const errMsg = String(err?.message || '').toLowerCase();
        const isRecoverable =
          errMsg.includes('not available') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('404') ||
          errMsg.includes('not found') ||
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('resource_exhausted');

        if (!isRecoverable) {
          break;
        }
      }
    }

    if (lastError && !reply) {
      throw lastError;
    }

    return res.json({
      reply,
      model: usedModel,
      requestedModel,
      temperature: activeTemperature,
      topP: activeTopP,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Gemini API execution error:', error);
    return res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء معالجة استفسار راوي المنارة الذكي.',
    });
  }
});

// Dedicated Ingestion Engine: Transforms raw curriculum notes/text into full LessonScript, TimelineEvent[], QuizQuestion[]
app.post('/api/ingest-lesson', async (req, res) => {
  try {
    const {
      trackId = 'track2',
      lessonTitle = '',
      unitTitle = '',
      academicSubtitle = '',
      targetSubject = 'التاريخ الوطني',
      rawContent = '',
      modelType = 'flash',
    } = req.body;

    if (!rawContent || typeof rawContent !== 'string' || rawContent.trim().length === 0) {
      return res.status(400).json({ error: 'يرجى تقديم النص المنهجي أو ملخص المذكرة لتحويله ذكياً.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'مفتاح GEMINI_API_KEY غير مهيأ في بيئة الخادم. يرجى ضبطه في المتغيرات البيئية.'
      });
    }

    const promptText = `أنت المحرك الأكاديمي والوثائقي لمنصة «أكاديمية المنارة التعليمية».
مهمتك: تحويل النص المنهجي الخام التالي إلى كائن متكامل يتضمن:
1. درس كامل (LessonScript) بالهيكل السداسي لواجهة الطالب واسكريبت وثائقي وقور لساحة المعلم مع الكروت التزامنية الأربعة.
2. أحداث الخط الزمني (TimelineEvent[]) المرتبطة بالدرس وفق القاعدة الإلزامية الصارمة: أي حدث تاريخي ليس له تاريخ رقمي صريح في النص/كتاب الوزارة يُكتب تاريخه حتماً "غير محدد في الوحدة" مع isExactDate: false.
3. بنك أسئلة تقييمية (QuizQuestion[]) من 3 إلى 5 أسئلة للمستويات العليا مع مصفاة الاستبعاد الذكي.

ضوابط الهوية الأكاديمية الصارمة:
- المسمى المؤسسي: «أكاديمية المنارة التعليمية» فقط دون أسماء شخصية.
- الشعار الرسمي: «هنذاكر ${targetSubject || 'التاريخ'} سوا» 🎯
- الحظر التام: يُمنع منعاً باتاً استخدام عبارة "فهم مش حفظ".
- الاسكريبت الوثائقي: يتضمن علامات الإلقاء الصوتي لمحركات الـ TTS: [توقف قصير]، [نبرة هادئة]، [نبرة حماسية]، [وقفة تأملية]، ومزج متزن راقٍ بين الفصحى الرصينة والعامية المصرية المهذبة، وينتهي بالبانر الختامي الإلزامي:
أكاديمية المنارة التعليمية | «هنذاكر ${targetSubject || 'التاريخ'} سوا» 🎯 | واتساب: 01097083710

بيانات المسار والدرس المرجعية:
- معرف المسار (trackId): "${trackId}"
- عنوان الدرس المقترح: "${lessonTitle || 'استنبط عنواناً صريحاً ومباشراً'}"
- عنوان الوحدة المقترح: "${unitTitle || 'الوحدة المنهجية المعتمدة'}"
- التوصيف الأكاديمي: "${academicSubtitle || `${targetSubject} — مقرر معتمد`}"
- المادة: "${targetSubject}"

النص المنهجي الخام المراد معالجته:
"""
${rawContent}
"""

أخرج ناتجك بصيغة JSON حصرية وصحيحة 100% تطابق الكائن التالي تماماً:
{
  "lesson": {
    "id": "ingested-${Date.now()}",
    "trackId": "${trackId}",
    "lessonTitle": "شرح درس ...",
    "unitTitle": "الوحدة ...",
    "academicSubtitle": "...",
    "documentaryScript": "...",
    "cards": {
      "question": "سؤال محوري فكري أو تطبيقي",
      "definition": "المفهوم أو المصطلح المنهجي",
      "trick": "تريكة الامتحان وناتج التعلم المركب",
      "answer": "الإجابة المنهجية الحاسمة"
    },
    "studentSummary": {
      "coreConcept": "ملخص المفهوم الجوهري",
      "quickCapsule": "كبسولة الفهم السريعة",
      "directExamTrick": "تريكة الامتحان المباشرة",
      "learningOutcomes": ["ناتج تعلم 1", "ناتج تعلم 2", "ناتج تعلم 3"],
      "conceptsGlossary": [
        { "term": "المصطلح", "definition": "التعريف العلمي", "modernSystemSignificance": "الدلالة الامتحانية" }
      ],
      "axesExplanations": [
        { "axisTitle": "المحور المنهجي", "cause": "السبب والعلة", "effect": "النتيجة والأثر", "simpleExplanation": "الشرح المبسط الوافي" }
      ],
      "specializedCorner": { "type": "archaeological", "title": "إضاءة تاريخية وأثرية متخصصة", "content": "..." },
      "visualEquation": "عنصر أ + عنصر ب ⬅️ ناتج تعلم حاسم",
      "brainTeaser": { "question": "سؤال فكري لتوليد الفضول", "hintOrSolution": "مفتاح الحل والتحليل" }
    }
  },
  "timelineEvents": [
    {
      "id": "ev-ingested-${Date.now()}-1",
      "trackId": "${trackId}",
      "unit": "u1",
      "title": "عنوان الحدث",
      "dateDisplay": "السنة أو غير محدد في الوحدة",
      "isExactDate": true,
      "era": "م أو ق.م",
      "description": "شرح الحدث وناتجه",
      "learningOutcome": "ناتج التعلم المستهدف",
      "examTrick": "تريكة الامتحان",
      "curriculumAxis": "المحور المنهجي"
    }
  ],
  "quizQuestions": [
    {
      "id": "q-ingested-${Date.now()}-1",
      "trackId": "${trackId}",
      "unit": "الوحدة",
      "questionText": "رأس السؤال التقييمي",
      "options": ["خيار أ", "خيار ب", "خيار ج", "خيار د"],
      "correctIndex": 1,
      "explanation": "التحليل المنهجي وسبب اختيار البديل",
      "learningOutcomeCode": "ن.ت: 1",
      "cognitiveLevel": "تحليل",
      "eliminationStrategy": "خطوات استبعاد البدائل الخاطئة ومطابقة ناتج التعلم"
    }
  ]
}`;

    const requestedModel = modelType === 'pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const modelsToAttempt = [requestedModel, 'gemini-3.8-flash', 'gemini-3.5-flash-lite'];

    let jsonResponse: any = null;
    let lastError: any = null;
    let usedModel = requestedModel;

    for (const curModel of modelsToAttempt) {
      try {
        const response = await ai.models.generateContent({
          model: curModel,
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          config: {
            systemInstruction: ACADEMY_SYSTEM_INSTRUCTION,
            temperature: 0.65,
            topP: 0.95,
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        // Safe JSON parsing
        const cleanedText = rawText.trim().replace(/^```json/i, '').replace(/```$/i, '').trim();
        jsonResponse = JSON.parse(cleanedText);
        usedModel = curModel;
        lastError = null;
        break;
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || '').toLowerCase();
        const isRecoverable =
          errMsg.includes('not available') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('404') ||
          errMsg.includes('503') ||
          errMsg.includes('429');

        if (!isRecoverable) {
          // If JSON parse failed, try next or break
          continue;
        }
      }
    }

    if (!jsonResponse) {
      throw lastError || new Error('فشل استخلاص وتوليد كائن الدرس بصيغة JSON صالحة.');
    }

    return res.json({
      success: true,
      model: usedModel,
      data: jsonResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Ingest Lesson API Error:', error);
    return res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء معالجة وتغذية الدرس الجديد ذكياً.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'أكاديمية المنارة التعليمية',
    model: 'gemini-2.5-flash',
    supportedModels: ['gemini-2.5-flash', 'gemini-2.5-pro'],
    defaultTemperature: 0.65,
    defaultTopP: 0.95,
    hasApiKey: !!apiKey,
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Manara Engine] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
