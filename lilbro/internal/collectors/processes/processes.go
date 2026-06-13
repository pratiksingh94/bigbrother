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

// type ProcessInfo struct {
// 	PID int
// 	Name string
// }

func Run(cfg config.Config) {
	prevProcesses := make(map[int]string)
	initProcesses, err := process.Processes()

	if err == nil {
		for _, p := range initProcesses {
			name, err := p.Name()
			if err != nil {
				continue
			}

			prevProcesses[int(p.Pid)] = name
		}
	}

	go func() {
		ticker := time.NewTicker(10 * time.Second)

		defer ticker.Stop()

		for range ticker.C {
			// fmt.Println("tick")
			currProceses := make(map[int]string)
			processes, err := process.Processes()
			if err != nil {
				fmt.Println("failed to get processes")
			}

			for _, p := range processes {
				name, _ := p.Name()
				currProceses[int(p.Pid)] = name
			}

			added, removed := FindDifference(prevProcesses, currProceses)

			for pid, name := range added {
				if ShouldIgnore(name) {
					continue
				}

				ev := api.EventPayload{
					Type: "process.creation",
					Payload: map[string]any{
						"pid":  pid,
						"name": name,
					},
				}

				events.Emit(ev)
			}

			for pid, name := range removed {
				if ShouldIgnore(name) {
					continue
				}

				ev := api.EventPayload{
					Type: "process.terminate",
					Payload: map[string]any{
						"pid":  pid,
						"name": name,
					},
				}

				events.Emit(ev)
			}

			// maps.Copy(prevProcesses, currProceses)
			prevProcesses = currProceses
		}
	}()
}

func FindDifference(m1 map[int]string, m2 map[int]string) (added, removed map[int]string) {
	added = make(map[int]string)
	removed = make(map[int]string)

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
