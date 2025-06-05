import { http, HttpResponse, delay } from 'msw'

// ESI API handlers
export const esiHandlers = [
  // Character skills
  http.get('https://esi.evetech.net/latest/characters/:characterId/skills/', async () => {
    await delay(100);
    return HttpResponse.json({
      skills: [
        { skill_id: 3300, active_skill_level: 4, trained_skill_level: 4 },
        { skill_id: 3301, active_skill_level: 3, trained_skill_level: 3 },
        { skill_id: 3302, active_skill_level: 5, trained_skill_level: 5 }
      ],
      total_sp: 5500000,
      unallocated_sp: 10000
    })
  })
]

// EVE Login/OAuth handlers
export const authHandlers = [
  // Token exchange
  http.post('https://login.eveonline.com/v2/oauth/token', async () => {
    await delay(100);
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 1200,
      token_type: 'Bearer'
    })
  })
]

// SDE API handlers
export const sdeHandlers = [
  // SDE download
  http.get('https://eve-static-data-export.s3-eu-west-1.amazonaws.com/tranquility/sde.zip', async () => {
    // Mock a stream response for testing without actual download
    return new HttpResponse(new Uint8Array([0, 1, 2, 3]), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Length': '4'
      }
    })
  }),

  // SDE MD5 checksum
  http.get('https://eve-static-data-export.s3-eu-west-1.amazonaws.com/tranquility/sde.zip.md5', async () => {
    await delay(50);
    return HttpResponse.text('00000000000000000000000000000000')
  })
]

// All handlers combined
export const handlers = [
  ...esiHandlers,
  ...authHandlers,
  ...sdeHandlers
] 