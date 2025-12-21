// 入力システムの型定義

export interface KeyPress {
  readonly str: string;
  readonly key: {
    readonly name?: string;
    readonly ctrl?: boolean;
    readonly shift?: boolean;
    readonly meta?: boolean;
  };
}

export interface InputState {
  readonly queue: readonly KeyPress[];
}
