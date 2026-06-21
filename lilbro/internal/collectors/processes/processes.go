package processes

import (
	"fmt"
	"lilbro/internal/api"
	"lilbro/internal/config"
	"lilbro/internal/events"
	"strings"
	"time"

	"github.com/shirou/gopsutil/v4/process"
)

type ProcessInfo struct {
	PID        int    `json:"pid"`
	PPID       int    `json:"ppid"`
	Name       string `json:"name"`
	CmdLine    string `json:"cmdline"`
	User       string `json:"user"`
	Cwd        string `json:"cwd"`
	CreateTime string `json:"create_time"`
}

func Run(cfg config.Config) {
	prevProcesses := make(map[int]ProcessInfo)
	initProcesses, err := process.Processes()

	if err == nil {
		for _, p := range initProcesses {
			name, _ := p.Name()
			ppid, _ := p.Ppid()
			cmdline, _ := p.Cmdline()
			user, _ := p.Username()
			cwd, _ := p.Cwd()
			createTime, _ := p.CreateTime()

			if name == "" || ppid == -1 {
				continue
			}

			prevProcesses[int(p.Pid)] = ProcessInfo{
				PID:        int(p.Pid),
				PPID:       int(ppid),
				Name:       name,
				CmdLine:    cmdline,
				User:       user,
				Cwd:        cwd,
				CreateTime: time.UnixMilli(createTime).UTC().Format(time.RFC3339),
			}
		}
	}

	go func() {
		ticker := time.NewTicker(10 * time.Second)

		defer ticker.Stop()

		for range ticker.C {
			// fmt.Println("tick")
			currProceses := make(map[int]ProcessInfo)
			processes, err := process.Processes()
			if err != nil {
				fmt.Println("failed to get processes")
			}

			for _, p := range processes {
				name, _ := p.Name()
				ppid, _ := p.Ppid()
				cmdline, _ := p.Cmdline()
				user, _ := p.Username()
				cwd, _ := p.Cwd()
				createTime, _ := p.CreateTime()

				if name == "" || ppid == -1 {
					continue
				}

				currProceses[int(p.Pid)] = ProcessInfo{
					Name:       name,
					PID:        int(p.Pid),
					PPID:       int(ppid),
					CmdLine:    cmdline,
					User:       user,
					Cwd:        cwd,
					CreateTime: time.UnixMilli(createTime).UTC().Format(time.RFC3339),
				}
			}

			added, removed := FindDifference(prevProcesses, currProceses)

			for _, proc := range added {
				if ShouldIgnore(proc.Name) {
					continue
				}

				ev := api.EventPayload{
					Type:    "process.creation",
					Payload: proc,
				}

				events.Emit(ev)
			}

			for _, proc := range removed {
				if ShouldIgnore(proc.Name) {
					continue
				}

				ev := api.EventPayload{
					Type:    "process.terminate",
					Payload: proc,
				}

				events.Emit(ev)
			}

			// maps.Copy(prevProcesses, currProceses)
			prevProcesses = currProceses
		}
	}()
}

func FindDifference(m1 map[int]ProcessInfo, m2 map[int]ProcessInfo) (added, removed map[int]ProcessInfo) {
	added = make(map[int]ProcessInfo)
	removed = make(map[int]ProcessInfo)

	for k, v := range m2 {
		_, exist := m1[k]
		if !exist {
			added[k] = v
		}
	}

	for k, v := range m1 {
		_, exist := m2[k]
		if !exist {
			removed[k] = v
		}
	}

	return added, removed
}

func ShouldIgnore(name string) bool {
	prefixes := []string{
		"kworker/",
		"ksoftirqd/",
		"migration/",
		"cpuhp/",
		"idle_inject/",
		"irq/",
		"rcu_",
		"card",
		"sleep",
	}

	for _, p := range prefixes {
		if strings.HasPrefix(name, p) {
			return true
		}
	}

	return false
}
