import { ImageResponse } from 'next/og';

export const alt = 'Public Boat Ramps Directory';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '76px 90px',
          color: '#fff',
          background: 'linear-gradient(145deg, #0a1628 0%, #1e3a5f 100%)',
        }}
      >
        <div style={{ color: '#e8c97a', fontSize: 30, letterSpacing: 5, textTransform: 'uppercase' }}>
          Public Access Directory
        </div>
        <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 1.05, marginTop: 26 }}>
          Find a public boat ramp.
        </div>
        <div style={{ color: '#d2dbe7', fontSize: 34, marginTop: 30 }}>
          Source-attributed facility records, fee status, and directions.
        </div>
      </div>
    ),
    size,
  );
}
