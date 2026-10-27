package main

import (
	"flag"
	"fmt"
	"os"

	"lilbro/internal/agent"
	"lilbro/internal/collectors/auth"
	"lilbro/internal/collectors/processes"
	"lilbro/internal/config"
	"lilbro/internal/events"
)

func main() {
	fmt.Println("Big Brother is watching, lil bro gonna help him watch.")

	serverURL := flag.String("server", os.Getenv("LILBRO_SERVER_URL"), "url of the Big Brother server")
	agentID := flag.String("id", os.Getenv("LILBRO_AGENT_ID"), "id of this agent, one is made when it is missing")
	configPath := flag.String("config", os.Getenv("LILBRO_CONFIG"), "path of the config file")
	flag.Parse()

	cfg, err := config.Load(config.Options{
		ServerURL: *serverURL,
		AgentID:   *agentID,
		Path:      *configPath,
	})
	if err != nil {
		fmt.Println("Error reading config:", err)
		return
	}

	events.RunEventWorker(cfg)

	agent.RunHeartbeatLoop(cfg)

	processes.Run(cfg)

	auth.Run()

	select {}
}
