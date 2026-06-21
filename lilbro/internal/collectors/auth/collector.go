package auth

import (
	"bufio"
	"encoding/json"
	"lilbro/internal/api"
	"lilbro/internal/events"
	"os/exec"
	"strconv"
	"time"
)

func Run() {
	cmd := exec.Command("journalctl", "-f", "-u", "sshd", "-o", "json", "--since", "now")
	stdout, _ := cmd.StdoutPipe()
	cmd.Start()

	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		var entry map[string]any

		if err := json.Unmarshal(scanner.Bytes(), &entry); err != nil {
			continue
		}

		message, _ := entry["MESSAGE"].(string)
		tsStr, _ := entry["__REALTIME_TIMESTAMP"].(string)

		microseconds, err := strconv.ParseInt(tsStr, 10, 64)
		if err != nil {
			microseconds = time.Now().UTC().UnixMicro()
		}

		event_type, payload := ParseLine(message)
		if payload == nil {
			continue
		}

		logInfo := api.LogPayload{
			Source:     "systemd-journald",
			Raw:        message,
			IngestedAt: time.UnixMicro(microseconds).UTC().Format(time.RFC3339),
		}
		ev := api.EventPayload{
			Type:    event_type,
			Payload: payload,
			Log:     &logInfo,
		}

		events.Emit(ev)

		// fmt.Println(message)
	}
}
