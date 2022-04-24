import { Application, Sprite } from 'pixi.js';
import { RomData } from '../rom-mod/RomInterfaces';

class errTemplate<T> {
  toCheck?: T | null;
  msg: string;
  constructor(errorMsg: string, toCheck?: T | null) {
    this.toCheck = toCheck;
    this.msg = errorMsg;
  }
  execute() {
    if (!this.toCheck) {
      console.error(this.msg);
    }
    return !this.toCheck;
  }
}

export function hasCustomError<T>(toCheck: T, msg: string) {
  const err = new errTemplate<T>(msg, toCheck);
  return err.execute();
}
export function hasPixieError(pixiApp: Application | null) {
  const msg = 'PixiJS App not started';
  const err = new errTemplate<Application | null>(msg, pixiApp);
  return err.execute();
}
export function hasRomError(romData: RomData) {
  const msg = 'romData not retrieved';
  const err = new errTemplate<RomData>(msg, romData);
  return err.execute();
}
export function hasSpriteError(sprite?: Sprite) {
  const msg = 'interactiveSprite is null!';
  const err = new errTemplate<Sprite>(msg, sprite);
  return err.execute();
}
