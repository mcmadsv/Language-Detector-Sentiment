package dk.ek.languagedetectorsentiment.controller;

import dk.ek.languagedetectorsentiment.dto.MyResponse;
import dk.ek.languagedetectorsentiment.service.OpenAiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/nlp")
@CrossOrigin(origins = "*")
public class NlpController {

    private final OpenAiService service;

    // SYSTEM PROMPTS (stramme, deterministiske)

    private static final String SYS_LANG =
            "You are a language identifier. "
                    + "Reply with ONLY the ISO 639-1 language code for the input text "
                    + "(e.g., en, es, ru, da). If uncertain, reply 'und'. No explanation.";

    private static final String SYS_TRANSLATE_PREFIX =
            "You are a precise translator. "
                    + "Translate the user's text into the target language (ISO 639-1 code). "
                    + "Output ONLY the translated text. No commentary. Target language: ";

    private static final String SYS_SENTIMENT =
            "You are a strict sentiment classifier. "
                    + "You must ALWAYS reply in English with EXACTLY ONE of these words: positive, neutral, negative. "
                    + "Do NOT translate the input text. Do NOT explain. Do NOT add punctuation. "
                    + "Your entire output must be ONLY that single word.";

    private static final String SYS_ANALYZE_PREFIX =
            "You are an NLP helper. "
                    + "First identify language (ISO 639-1). "
                    + "Then classify sentiment using EXACTLY one of these words (English only): positive, neutral, negative. "
                    + "Then translate the input text into the target language (ISO 639-1). "
                    + "Reply in this EXACT format (no extra words):\n"
                    + "lang:<code>\n"
                    + "sentiment:<word>\n"
                    + "translation:<text>\n"
                    + "Target language: ";

    public NlpController(OpenAiService service) {
        this.service = service;
    }

    // -------------------------------------------------------------
    // API ENDPOINTS
    // -------------------------------------------------------------

    @GetMapping("/lang")
    public MyResponse detectLanguage(@RequestParam String text) {
        return service.makeRequest(text, SYS_LANG);
    }

    @GetMapping("/translate")
    public MyResponse translate(@RequestParam String text, @RequestParam String to) {
        String sys = SYS_TRANSLATE_PREFIX + to;
        return service.makeRequest(text, sys);
    }

    @GetMapping("/sentiment")
    public MyResponse sentiment(@RequestParam String text) {
        return service.makeRequest(text, SYS_SENTIMENT);
    }

    @GetMapping("/analyze")
    public MyResponse analyze(@RequestParam String text, @RequestParam String to) {
        String sys = SYS_ANALYZE_PREFIX + to;
        return service.makeRequest(text, sys);
    }
}
