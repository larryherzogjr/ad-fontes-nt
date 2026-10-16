import evaluationNative from './version.json' with { type: 'json' };
declare const __AF_EVALUATION__: boolean;
/** Build-time edition boundary. No access decision relies on this browser flag. */
export const evaluationEdition = typeof __AF_EVALUATION__ !== 'undefined' && __AF_EVALUATION__;
export const evaluationRelease = 'evaluation-resources-2026-10-16-v1';
export const evaluationOrigin = 'https://eval.ad-fontes.app';
export function evaluationContentBase() {
 return typeof location !== 'undefined' && (location.protocol === 'tauri:' || location.hostname === 'tauri.localhost' || document.documentElement.dataset.evaluationOffline === 'true')
  ? `/evaluation-content/${evaluationRelease}` : '/api/evaluation/content';
}

export const evaluationVersion = evaluationNative.version;
