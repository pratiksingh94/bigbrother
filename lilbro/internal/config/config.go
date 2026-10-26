package config

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

type Config struct {
	ID        string `json:"id"`
	ServerURL string `json:"server_url"`
}

func CreateConfig() error {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return err
	}

	appDir := filepath.Join(configDir, "lilbro")

	err = os.MkdirAll(appDir, 0700)
	if err != nil {
		return err
	}

	path := filepath.Join(appDir, "config.json")

	reader := bufio.NewReader(os.Stdin)

	fmt.Print("Enter Big Brother server URL: ")
	serverURL, err := reader.ReadString('\n')
	if err != nil {
		fmt.Println("Error reading input:", err)
		return err
	}

	cfg := Config{
		ID:        uuid.NewString(),
		ServerURL: strings.TrimSpace(serverURL),
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0600)

}

func EnsureConfig() {
	configDir, _ := os.UserConfigDir()

	// configFilePath := fmt.Sprintf("%s/lilbro/config.json", configDir)
	configFilePath := filepath.Join(configDir, "lilbro", "config.json")

	_, err := os.Stat(configFilePath)
	if os.IsNotExist(err) {
		fmt.Println("Config file not found, creating one...")
		CreateConfig()
	}
}

func GetConfig() (Config, error) {
	configDir, _ := os.UserConfigDir()
	configFilePath := filepath.Join(configDir, "lilbro", "config.json")

	data, err := os.ReadFile(configFilePath)
	if err != nil {
		return Config{}, err
	}

	var cfg Config

	err = json.Unmarshal(data, &cfg)
	if err != nil {
		return Config{}, err
	}

	return cfg, nil
}
