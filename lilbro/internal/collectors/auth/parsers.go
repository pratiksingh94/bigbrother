package auth

import (
	"lilbro/internal/helpers"
	"regexp"
	"strings"
)

func ParseLine(line string) (string, map[string]any) {
	if strings.Contains(line, "Failed password") {
		return "authentication.failure", ParseFailedPassword(line)
	} else if strings.Contains(line, "Accepted password") {
		return "authentication.success", ParseAcceptedPassword(line)
	}

	return "", nil
}

func ParseFailedPassword(line string) map[string]any {
	re := regexp.MustCompile(`Failed password for (?:(?P<invalid>invalid user) )?(?P<user>\S+) from (?P<ip>\S+) port (?P<port>\d+)`)
	match := re.FindStringSubmatch(line)

	invalid := helpers.GetNamedGroup(re, match, "invalid")
	user := helpers.GetNamedGroup(re, match, "user")
	ip := helpers.GetNamedGroup(re, match, "ip")
	port := helpers.GetNamedGroup(re, match, "port")

	payload := map[string]any{
		"user":        user,
		"source_ip":   ip,
		"source_port": port,
	}

	if invalid == "" {
		payload["invalid_user"] = false
	} else {
		payload["invalid_user"] = true
	}

	return payload
}

func ParseAcceptedPassword(line string) map[string]any {
	// Jun 18 20:09:33 archlinux sshd-session[75803]: Accepted password for plutonium from ::1 port 41200 ssh2
	re := regexp.MustCompile(`Accepted password for (?P<user>\S+) from (?P<ip>\S+) port (?P<port>\d+)`)
	match := re.FindStringSubmatch(line)

	user := helpers.GetNamedGroup(re, match, "user")
	ip := helpers.GetNamedGroup(re, match, "ip")
	port := helpers.GetNamedGroup(re, match, "port")

	payload := map[string]any{
		"user":        user,
		"source_ip":   ip,
		"source_port": port,
	}

	return payload
}
