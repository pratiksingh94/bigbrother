package system

import (
	"os"
	"runtime"

	"golang.org/x/sys/unix" // no windows support for now lmao
)

type SysInfo struct {
	Hostname      string
	OSName        string
	KernelVersion string
}

func GetSysInfo() SysInfo {
	var uts unix.Utsname
	unix.Uname(&uts)

	hostname, _ := os.Hostname()
	osName := runtime.GOOS

	info := SysInfo{
		Hostname:      hostname,
		OSName:        osName,
		KernelVersion: unix.ByteSliceToString(uts.Release[:]),
	}

	return info
}
