package agent

import (
	"fmt"
	"lilbro/internal/api"
	"lilbro/internal/config"
	"lilbro/internal/system"
	"time"
)

func RunHeartbeatLoop(cfg config.Config) {

	sysinfo := system.GetSysInfo()
	payload := api.HeartbeatPayload{
		ID:            cfg.ID,
		Hostname:      sysinfo.Hostname,
		KernelVersion: sysinfo.KernelVersion,
		OSName:        sysinfo.OSName,
	}

	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	// sending once then timer starts
	err := api.SendHeartbeat(cfg.ServerURL, payload)
	if err != nil {
		fmt.Println("error in heartbeat:", err)
	} else {
		fmt.Println("heartbeat sent")
	}

	for range ticker.C {
		err := api.SendHeartbeat(cfg.ServerURL, payload)

		if err != nil {
			fmt.Println("error in heartbeat:", err)
		} else {
			fmt.Println("heartbeat sent")
		}
	}
}
