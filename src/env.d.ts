/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime: { env: Record<string, any>; ctx?: any };
    user?: any;
    member?: any;
    workspace?: any;
    trial?: any;
    session?: any;
  }
}
