package main

import (
	"fmt"
	"lilbro/internal/agent"
	"lilbro/internal/collectors/processes"
	"lilbro/internal/config"
	"lilbro/internal/events"
)

func main() {
	fmt.Println("Big Brother is watching, lil bro gonna help him watch.")
	config.EnsureConfig()

	cfg, err := config.GetConfig()
	if err != nil {
		fmt.Println("Error reading config:", err)
		return
	}

	events.RunEventWorker(cfg)

	agent.RunHeartbeatLoop(cfg)

	processes.Run(cfg)

	select {}
}
