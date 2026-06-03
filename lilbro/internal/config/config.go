package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

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

	err = os.MkdirAll(appDir, 0755)
	if err != nil {
		return err
	}

	path := filepath.Join(appDir, "config.json")

	var serverURL string

	fmt.Print("Enter Big Brother server URL: ")
	_, err = fmt.Scan(&serverURL)

	if err != nil {
		fmt.Println("Error reading input:", err)
		return err
	}

	id := uuid.NewString()
	cfg := Config{ID: id, ServerURL: serverURL}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)

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
