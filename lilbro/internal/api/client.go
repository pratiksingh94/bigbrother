package api

import (
	"fmt"

	"lilbro/internal/config"
)

type HeartbeatPayload struct {
	ID            string `json:"id"`
	Hostname      string `json:"hostname"`
	KernelVersion string `json:"kernel_version"`
	OSName        string `json:"os_name"`
}

func SendHeartbeat(cfg config.Config, payload HeartbeatPayload) error {
	heartbeatEndpoint := fmt.Sprintf("%s/agents/heartbeat", cfg.ServerURL)

	return send(heartbeatEndpoint, payload)
}
