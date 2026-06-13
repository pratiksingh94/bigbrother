package events

import (
	"lilbro/internal/api"
	"lilbro/internal/config"
)

var EventQueue = make(chan api.EventPayload, 1000)

func Emit(ev api.EventPayload) {
	EventQueue <- ev
}

func RunEventWorker(cfg config.Config) {
	go func() {
		for event := range EventQueue {
			api.SendEvent(cfg, event)
		}
	}()
}
