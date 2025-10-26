/**
 * PRISM Constants
 * Phase 1: Basic configuration constants
 */

export const EXTENSION_VERSION = '1.0.0';
export const CURRENT_PHASE = 1;

export const MESSAGE_TYPES = {
  PING: 'PING',
  GET_STATUS: 'GET_STATUS',
  GET_TAB_INFO: 'GET_TAB_INFO',
  GET_PAGE_INFO: 'GET_PAGE_INFO'
} as const;

export const STORAGE_KEYS = {
  EXTENSION_ACTIVE: 'extensionActive',
  VERSION: 'version',
  INSTALL_DATE: 'installDate',
  PHASE: 'phase'
} as const;
