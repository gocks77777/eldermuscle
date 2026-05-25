const HEC_URL = process.env.SPLUNK_HEC_URL
const HEC_TOKEN = process.env.SPLUNK_HEC_TOKEN
const hasSplunk = Boolean(HEC_URL && HEC_TOKEN && !HEC_TOKEN.includes('your_splunk'))

export type SplunkEvent = {
  source: string
  event: Record<string, unknown>
}

export async function logToSplunk(source: string, event: Record<string, unknown>): Promise<void> {
  if (!hasSplunk) {
    console.log('[Splunk Demo]', source, JSON.stringify(event))
    return
  }

  try {
    await fetch(`${HEC_URL}/services/collector/event`, {
      method: 'POST',
      headers: {
        'Authorization': `Splunk ${HEC_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        time: Math.floor(Date.now() / 1000),
        source: 'eldermuscle',
        sourcetype: source,
        event,
      }),
    })
  } catch (err) {
    console.error('[Splunk] Failed to send event:', err)
  }
}
