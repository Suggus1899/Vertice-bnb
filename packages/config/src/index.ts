// ============================================
// Configuración Base de TypeScript
// Para todos los paquetes del monorepo
// ============================================

import type { CompilerOptions } from 'typescript';
import { ModuleKind, ModuleResolutionKind, ScriptTarget, JsxEmit } from 'typescript';

export const baseConfig: CompilerOptions = {
  target: ScriptTarget.ES2022,
  lib: ['ES2022'],
  module: ModuleKind.ESNext,
  moduleResolution: ModuleResolutionKind.Bundler,
  strict: true,
  noUncheckedIndexedAccess: true,
  noImplicitOverride: true,
  exactOptionalPropertyTypes: true,
  skipLibCheck: true,
  incremental: true,
  esModuleInterop: true,
  resolveJsonModule: true,
  isolatedModules: true,
  noEmit: true,
};

export const nodeConfig: CompilerOptions = {
  ...baseConfig,
  lib: ['ES2022'],
};

export const reactConfig: CompilerOptions = {
  ...baseConfig,
  lib: ['dom', 'dom.iterable', 'esnext'],
  jsx: JsxEmit.ReactJSX,
};

export const reactNativeConfig: CompilerOptions = {
  ...baseConfig,
  lib: ['ES2022'],
  jsx: JsxEmit.ReactNative,
};
