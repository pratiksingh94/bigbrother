package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"lilbro/internal/config"
	"net/http"
)

type LogPayload struct {
	Source     string `json:"source"`
	Raw        string `json:"raw"`
	IngestedAt string `json:"ingested_at"`
}

type EventPayload struct {
	Type    string      `json:"event_type"`
	Payload any         `json:"payload"`
	Log     *LogPayload `json:"log,omitempty"`
}

func SendEvent(cfg config.Config, payload EventPayload) error {
	eventEndpoint := fmt.Sprintf("%s/agents/%s/events", cfg.ServerURL, cfg.ID)

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	resp, err := http.Post(eventEndpoint, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("sending event: %w", err)
	}

	// respBody, _ := io.ReadAll(resp.Body)
	// fmt.Println(resp.StatusCode, string(respBody))

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("event unexpected status: %s", resp.Status)
	}

	return nil
}
