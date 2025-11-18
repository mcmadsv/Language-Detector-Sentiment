package dk.ek.languagedetectorsentiment.service;

import dk.ek.languagedetectorsentiment.dto.ChatCompletionRequest;
import dk.ek.languagedetectorsentiment.dto.ChatCompletionResponse;
import dk.ek.languagedetectorsentiment.dto.MyResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.net.URI;

@Service
public class OpenAiService {

    private static final Logger log = LoggerFactory.getLogger(OpenAiService.class);

    @Value("${app.api-key}") private String apiKey;
    @Value("${app.url}")     private String url;
    @Value("${app.model}")   private String model;
    @Value("${app.temperature}") private double temperature;

    private final WebClient client = WebClient.create();

    public MyResponse makeRequest(String userPrompt, String systemMessage) {
        try {
            ChatCompletionRequest req = new ChatCompletionRequest();
            req.setModel(model);
            req.setTemperature(temperature);
            req.getMessages().add(new ChatCompletionRequest.Message("system", systemMessage));
            req.getMessages().add(new ChatCompletionRequest.Message("user", userPrompt));

            ChatCompletionResponse response = client.post()
                    .uri(new URI(url))
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(BodyInserters.fromValue(req))
                    .retrieve()
                    .bodyToMono(ChatCompletionResponse.class)
                    .block();

            if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Empty response from OpenAI");
            }

            String answer = response.getChoices().get(0).getMessage().getContent().trim();
            return new MyResponse(answer);

        } catch (WebClientResponseException e) {
            log.error("OpenAI error {}: {}", e.getRawStatusCode(), e.getResponseBodyAsString());
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "External AI call failed. Check backend logs."
            );
        } catch (Exception e) {
            log.error("Unexpected error", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal Server Error. Check backend logs."
            );
        }
    }
}
