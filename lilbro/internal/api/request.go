package api

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"lilbro/internal/config"
)

func send(cfg config.Config, endpoint string, payload any) error {
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return requestError(cfg, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("%s unexpected status: %s: %s", endpoint, resp.Status, detail(resp))
	}

	return nil
}

func requestError(cfg config.Config, err error) error {
	var urlErr *url.Error
	if errors.As(err, &urlErr) {
		err = urlErr.Err
	}

	message := fmt.Errorf("could not reach %s: %w", cfg.ServerURL, err)

	if !strings.HasPrefix(cfg.ServerURL, "https://") {
		return message
	}

	message = fmt.Errorf(
		"%w\n"+
			"                   a big brother server serves plain http, try --server http://%s",
		message, strings.TrimPrefix(cfg.ServerURL, "https://"))

	if cfg.Path != "" {
		message = fmt.Errorf("%w\n"+
			"                   and fix the url in %s", message, cfg.Path)
	}

	return message
}

func detail(resp *http.Response) string {
	body, err := io.ReadAll(resp.Body)
	if err != nil || len(body) == 0 {
		return ""
	}

	var payload struct {
		Detail string `json:"detail"`
	}
	if err := json.Unmarshal(body, &payload); err == nil && payload.Detail != "" {
		return payload.Detail
	}

	return strings.TrimSpace(string(body))
}
