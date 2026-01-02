export interface GitLogOptions {
  author?: string;
  grep?: string;
  since?: string;
  until?: string;
  format: string;
  output?: string;
}
