package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type HeartbeatPayload struct {
	ID            string `json:"id"`
	Hostname      string `json:"hostname"`
	KernelVersion string `json:"kernel_version"`
	OSName        string `json:"os_name"`
}

func SendHeartbeat(serverURL string, payload HeartbeatPayload) error {
	heartbeatEndpoint := fmt.Sprintf("%s/agents/heartbeat", serverURL)

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	resp, err := http.Post(heartbeatEndpoint, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("send heartbeat: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("heartbeat unexpected status: %s", resp.Status)
	}

	return nil
}
