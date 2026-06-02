package main

import (
	"fmt"
	"lilbro/internals/config"
)

func main() {
	fmt.Println("Big Brother is watching, lilbro gonna help him watch.")
	config.EnsureConfig()

	cfg, err := config.GetConfig()
	if err != nil {
		fmt.Println("Error reading config:", err)
		return
	}

	fmt.Println(cfg.ID)
	fmt.Println(cfg.ServerURL)
}
