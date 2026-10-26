package api

import (
	"fmt"

	"lilbro/internal/config"
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

	return send(eventEndpoint, payload)
}
