package processes

import "testing"

func TestNewSetHoldsBothForms(t *testing.T) {
	set := newSet("Isolated Service", "Isolated Web Content", "tmux: client")

	for _, want := range []string{
		"Isolated Service",
		"Isolated Servic",
		"Isolated Web Content",
		"Isolated Web Co",
		"tmux: client",
	} {
		if !set[want] {
			t.Errorf("%q should be in the set", want)
		}
	}
}

func TestTruncatedNamesAreIgnored(t *testing.T) {
	cases := []struct {
		name   string
		parent string
	}{
		{"Isolated Web Co", "chrome"},
		{"Isolated Servic", "chrome"},
		{"systemd-userwor", "systemd"},
		{"tmux: client", "tmux"},
		{"sleep", "bash"},
		{"dbus-broker", "systemd"},
		{"containerd-shim", "systemd"},
	}

	for _, c := range cases {
		if !ShouldIgnore(ProcessInfo{Name: c.name, User: "root"}, c.parent) {
			t.Errorf("%q should be ignored", c.name)
		}
	}
}

func TestExtendedNamesAreIgnored(t *testing.T) {
	cases := []string{
		"kprobe-optimizer",
		"pool_workqueue_release",
		"systemd-userwork",
	}

	for _, name := range cases {
		if !ShouldIgnore(ProcessInfo{Name: name, User: "root"}, "systemd") {
			t.Errorf("%q should be ignored", name)
		}
	}
}

func TestInterestingProcessesSurvive(t *testing.T) {
	names := []string{"nc", "netcat", "ncat", "tcpdump", "socat", "chisel", "python3", "postgres", "sshd"}

	for _, name := range names {
		if ShouldIgnore(ProcessInfo{Name: name, User: "root"}, "bash") {
			t.Errorf("%q should not be ignored", name)
		}
	}
}

func TestShellFromTerminalIsIgnored(t *testing.T) {
	if !ShouldIgnore(ProcessInfo{Name: "zsh", User: "root"}, "kitty") {
		t.Error("a shell started from a terminal should be ignored")
	}
	if ShouldIgnore(ProcessInfo{Name: "zsh", User: "root"}, "sshd") {
		t.Error("a shell started over ssh should not be ignored")
	}
}
