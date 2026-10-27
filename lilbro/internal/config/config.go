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

type Options struct {
	ServerURL string
	AgentID   string
	Path      string
}

func DefaultPath() string {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return ""
	}

	return filepath.Join(configDir, "lilbro", "config.json")
}
func Load(opts Options) (Config, error) {
	path := opts.Path
	if path == "" {
		path = DefaultPath()
	}

	cfg, err := read(path)
	if err != nil {
		if !os.IsNotExist(err) {
			return Config{}, err
		}

		cfg, err = create(path, opts)
		if err != nil {
			return Config{}, err
		}
	}

	if opts.ServerURL != "" {
		cfg.ServerURL = opts.ServerURL
	}
	if opts.AgentID != "" {
		cfg.ID = opts.AgentID
	}
	if cfg.ID == "" {
		cfg.ID = uuid.NewString()
	}

	return cfg, nil
}

func create(path string, opts Options) (Config, error) {
	if opts.ServerURL == "" {
		if err := ask(path); err != nil {
			return Config{}, err
		}
		return read(path)
	}

	cfg := Config{
		ID:        opts.AgentID,
		ServerURL: opts.ServerURL,
	}
	if cfg.ID == "" {
		cfg.ID = uuid.NewString()
	}

	if err := write(path, cfg); err != nil {
		return Config{}, err
	}

	return cfg, nil
}

func ask(path string) error {
	fmt.Println("Config file not found, creating one...")

	reader := bufio.NewReader(os.Stdin)

	fmt.Print("Enter Big Brother server URL: ")
	serverURL, err := reader.ReadString('\n')
	if err != nil {
		fmt.Println("Error reading input:", err)
		return err
	}

	return write(path, Config{
		ID:        uuid.NewString(),
		ServerURL: strings.TrimSpace(serverURL),
	})
}

func read(path string) (Config, error) {
	data, err := os.ReadFile(path)
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

func write(path string, cfg Config) error {
	if dir := filepath.Dir(path); dir != "" {
		if err := os.MkdirAll(dir, 0700); err != nil {
			return err
		}
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0600)
}
