package dk.ek.languagedetectorsentiment.dto;

import java.util.ArrayList;
import java.util.List;

public class ChatCompletionRequest {
    private String model;
    private List<Message> messages = new ArrayList<>();
    private double temperature;

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }
    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }

    public static class Message {
        private String role;
        private String content;

        public Message() {}
        public Message(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
