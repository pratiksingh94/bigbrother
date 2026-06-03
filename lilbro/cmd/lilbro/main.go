package main

import (
	"fmt"
	"lilbro/internal/agent"
	"lilbro/internal/config"
)

func main() {
	fmt.Println("Big Brother is watching, lil bro gonna help him watch.")
	config.EnsureConfig()

	cfg, err := config.GetConfig()
	if err != nil {
		fmt.Println("Error reading config:", err)
		return
	}

	agent.RunHeartbeatLoop(cfg)

	select {}
}
