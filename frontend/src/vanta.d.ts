// Vanta ships no type declarations; we load a single effect lazily and treat it
// as an opaque factory that returns something with a destroy() method.
declare module 'vanta/dist/vanta.fog.min' {
  const effect: (options: Record<string, unknown>) => { destroy: () => void }
  export default effect
}

// three (r0.134) ships no bundled .d.ts; we only touch it as the opaque object
// Vanta needs, loaded lazily. Treat the whole module as untyped.
declare module 'three'
