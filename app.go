package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"os/exec"
	"regexp"
	"strings"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

type Devices struct {
	IP       string
	MAC      string
	TYPE     string
	VENDOR   MacLookupResponse
	HOSTNAME string
}

type MacLookupResponse struct {
	Success    bool   `json:"success"`
	Found      bool   `json:"found"`
	MacPrefix  string `json:"macPrefix"`
	Company    string `json:"company"`
	Address    string `json:"address"`
	Country    string `json:"country"`
	BlockStart string `json:"blockStart"`
	BlockEnd   string `json:"blockEnd"`
	BlockSize  int    `json:"blockSize"`
	BlockType  string `json:"blockType"`
	Updated    string `json:"updated"`
}

func getHostname(ip string) string {
	names, err := net.LookupAddr(ip)
	if err != nil || len(names) == 0 {
		return "Unknow"
	}
	hostname := names[0]
	return strings.TrimSuffix(hostname, ".")
}

func getVendor(mac string) (MacLookupResponse, error) {

	mac = strings.ReplaceAll(strings.ReplaceAll(mac, "-", ""), ":", "")

	macPrefix := mac[0:6]

	url := fmt.Sprintf("https://api.maclookup.app/v2/macs/%s", macPrefix)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Errorf("Error %w", err)
		return MacLookupResponse{}, nil
	}

	req.Header.Set("User-Agent", "NetworkScanner/1.0")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return MacLookupResponse{}, fmt.Errorf("error %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 404 {
		return MacLookupResponse{}, fmt.Errorf("error %w", err)
	}
	if resp.StatusCode != 200 {
		return MacLookupResponse{}, fmt.Errorf("error %w", err)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return MacLookupResponse{}, fmt.Errorf("error %w", err)
	}

	var result MacLookupResponse

	err = json.Unmarshal(body, &result)
	if err != nil {
		return MacLookupResponse{}, fmt.Errorf("error reading %w", err)

	}

	return result, nil

}

func getArpTable() ([]Devices, error) {
	cmd := exec.Command("arp", "-a")
	output, err := cmd.Output()

	if err != nil {
		return []Devices{}, fmt.Errorf("error %w", err)
	}
	var devices []Devices
	lines := strings.Split(string(output), "\n")

	re := regexp.MustCompile(`\s+(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F-]+)\s+(dynamique|statique)`)

	for _, line := range lines {
		matches := re.FindStringSubmatch(line)
		if len(matches) >= 4 {
			ip := matches[1]
			mac := matches[2]
			deviceType := matches[3]

			if deviceType == "dynamique" {
				vendor, err := getVendor(mac)
				if err != nil {

					return []Devices{}, fmt.Errorf("error %w", err)
				}
				devices = append(devices, Devices{
					IP:       ip,
					MAC:      mac,
					TYPE:     deviceType,
					VENDOR:   vendor,
					HOSTNAME: getHostname(ip),
				})
			}
		}
	}
	return devices, nil

}

func (a *App) ListIp() ([]Devices, error) {
	data, err := getArpTable()
	if err != nil {
		return nil, fmt.Errorf("error %w", err)
	}
	return data, nil
}
