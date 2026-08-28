import React, { useState } from 'react';
import { ApiEndpointDefinition, UniUniConfig } from '../types/uniuni';
import { API_ENDPOINTS } from '../data/apiEndpoints';
import { UniUniApiClient } from '../services/apiClient';
import {
  Code2,
  Play,
  Copy,
  Check,
  Globe,
  Terminal,
  Send,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';

interface ApiExplorerViewProps {
  config: UniUniConfig;
  onOpenCredentials?: () => void;
}

export const ApiExplorerView: React.FC<ApiExplorerViewProps> = ({ config, onOpenCredentials }) => {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(API_ENDPOINTS[0].id);
  const [requestBodyText, setRequestBodyText] = useState<string>(
    JSON.stringify(API_ENDPOINTS[0].requestSchemaExample, null, 2)
  );
  const [selectedLang, setSelectedLang] = useState<'curl' | 'node' | 'python' | 'php' | 'go'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Runner state
  const [isRunning, setIsRunning] = useState(false);
  const [responseResult, setResponseResult] = useState<any | null>(null);

  const selectedEndpoint =
    API_ENDPOINTS.find((ep) => ep.id === selectedEndpointId) || API_ENDPOINTS[0];

  const handleSelectEndpoint = (endpoint: ApiEndpointDefinition) => {
    setSelectedEndpointId(endpoint.id);
    setRequestBodyText(JSON.stringify(endpoint.requestSchemaExample, null, 2));
    setResponseResult(null);
  };

  const getBaseUrl = () => {
    switch (config.environment) {
      case 'prod_global':
        return 'https://api.ship.uniuni.com/prod';
      case 'ca_qa':
        return 'https://sjqa.uniexpress.org';
      case 'ca_prod':
        return 'https://sj.uniexpress.ca';
      case 'us_qa':
        return 'https://prm-api.qa.uniuni.com';
      case 'us_prod':
        return 'https://prm-api.uniuni.com';
      default:
        return 'https://api-sandbox.ship.uniuni.com';
    }
  };

  const fullUrl = `${getBaseUrl()}${selectedEndpoint.path}`;

  // Execute request
  const handleExecuteRequest = async () => {
    setIsRunning(true);
    let parsedBody: any = undefined;
    try {
      if (selectedEndpoint.method !== 'GET' && requestBodyText.trim()) {
        parsedBody = JSON.parse(requestBodyText);
      }
    } catch (e: any) {
      alert('Invalid JSON request body: ' + e.message);
      setIsRunning(false);
      return;
    }

    try {
      const data = await UniUniApiClient.executeApiExplorer({
        url: fullUrl,
        method: selectedEndpoint.method,
        headers: {
          Authorization: `Bearer ${config.accessToken || 'demo_uniuni_access_token'}`,
        },
        body: parsedBody,
        mockFallback: selectedEndpoint.responseSchemaExample,
      });

      setResponseResult(data);
    } catch (err: any) {
      setResponseResult({
        success: false,
        status: 500,
        statusText: 'Network Error',
        durationMs: 40,
        data: { error: err.message },
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Generate code snippet
  const generateSnippet = () => {
    const token = config.accessToken || 'YOUR_ACCESS_TOKEN';

    if (selectedLang === 'curl') {
      if (selectedEndpoint.method === 'GET') {
        return `curl -X GET "${fullUrl}" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Accept: application/json"`;
      }
      return `curl -X ${selectedEndpoint.method} "${fullUrl}" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '${requestBodyText.replace(/'/g, "\\'")}'`;
    }

    if (selectedLang === 'node') {
      return `const response = await fetch("${fullUrl}", {
  method: "${selectedEndpoint.method}",
  headers: {
    "Authorization": "Bearer ${token}",
    "Content-Type": "application/json"
  }${selectedEndpoint.method !== 'GET' ? `,\n  body: JSON.stringify(${requestBodyText})` : ''}
});

const data = await response.json();
console.log(data);`;
    }

    if (selectedLang === 'python') {
      return `import requests

url = "${fullUrl}"
headers = {
    "Authorization": "Bearer ${token}",
    "Content-Type": "application/json"
}
${
  selectedEndpoint.method !== 'GET'
    ? `payload = ${requestBodyText}\n\nresponse = requests.${selectedEndpoint.method.toLowerCase()}(url, json=payload, headers=headers)`
    : `response = requests.get(url, headers=headers)`
}

print(response.status_code)
print(response.json())`;
    }

    if (selectedLang === 'php') {
      return `<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => '${fullUrl}',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => '${selectedEndpoint.method}',
  CURLOPT_HTTPHEADER => array(
    'Authorization: Bearer ${token}',
    'Content-Type: application/json'
  ),
  ${selectedEndpoint.method !== 'GET' ? `CURLOPT_POSTFIELDS => '${requestBodyText}',` : ''}
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;`;
    }

    if (selectedLang === 'go') {
      return `package main

import (
	"bytes"
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "${fullUrl}"
	req, _ := http.NewRequest("${selectedEndpoint.method}", url, bytes.NewBuffer([]byte(\`${requestBodyText}\`)))
	req.Header.Set("Authorization", "Bearer ${token}")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}`;
    }

    return '';
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyResponse = () => {
    if (responseResult) {
      navigator.clipboard.writeText(JSON.stringify(responseResult.data, null, 2));
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
            UniUni REST API Explorer
          </div>
          <h2 className="text-xl font-bold">Interactive API Tester & Snippet Studio</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Test live UniUni endpoints, inspect request/response payloads, and generate ready-to-use cURL, Node.js, Python, PHP, and Go client snippets.
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 font-mono text-xs shrink-0">
          <div className="text-slate-400 text-[10px]">CURRENT ENVIRONMENT:</div>
          <div className="text-emerald-400 font-bold text-sm">{config.environment.toUpperCase()}</div>
          <div className="text-slate-400 text-[10px] truncate max-w-xs">{getBaseUrl()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Endpoints Directory (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
            Official Endpoints (docs.uniuni.com)
          </div>
          <div className="space-y-1.5">
            {API_ENDPOINTS.map((ep) => {
              const isSelected = ep.id === selectedEndpointId;
              const methodColor =
                ep.method === 'GET'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : ep.method === 'POST'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200';

              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{ep.name}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        isSelected ? 'bg-slate-800 text-white border-slate-700' : methodColor
                      }`}
                    >
                      {ep.method}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono truncate ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {ep.path}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Request / Response / Code Builder (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Request Header Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono flex-1 overflow-hidden">
              <span
                className={`px-2 py-1 rounded font-bold text-xs ${
                  selectedEndpoint.method === 'GET'
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {selectedEndpoint.method}
              </span>
              <span className="text-slate-800 font-semibold truncate">{fullUrl}</span>
            </div>

            <button
              onClick={handleExecuteRequest}
              disabled={isRunning}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
            >
              {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isRunning ? 'Executing...' : 'Send Request'}
            </button>
          </div>

          {/* Description */}
          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 p-3 rounded-lg">
            {selectedEndpoint.description}
          </div>

          {/* Body Editor & Code Snippets Tabs */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Request Payload Editor */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  JSON Request Body
                </span>
                <span className="text-[10px] text-slate-400 font-mono">application/json</span>
              </div>
              <textarea
                rows={12}
                value={requestBodyText}
                onChange={(e) => setRequestBodyText(e.target.value)}
                className="w-full text-xs font-mono p-3 bg-slate-900 text-emerald-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y flex-1"
                spellCheck={false}
              ></textarea>
            </div>

            {/* Code Generator Snippets */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1">
                  {(['curl', 'node', 'python', 'php', 'go'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium uppercase transition ${
                        selectedLang === lang
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCopyCode}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>

              <pre className="w-full text-xs font-mono p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto resize-y flex-1">
                <code>{generateSnippet()}</code>
              </pre>
            </div>
          </div>

          {/* Response Inspector */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">Response Output</span>
                {responseResult && (
                  <>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                        responseResult.status < 300
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {responseResult.status} {responseResult.statusText || 'OK'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {responseResult.durationMs}ms
                    </span>
                  </>
                )}
              </div>

              {responseResult && (
                <button
                  onClick={handleCopyResponse}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedResponse ? 'Copied' : 'Copy Response JSON'}
                </button>
              )}
            </div>

            <pre className="w-full text-xs font-mono p-4 bg-slate-950 text-emerald-300 rounded-lg overflow-x-auto max-h-96">
              <code>
                {responseResult
                  ? JSON.stringify(responseResult.data || responseResult, null, 2)
                  : JSON.stringify(selectedEndpoint.responseSchemaExample, null, 2)}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
