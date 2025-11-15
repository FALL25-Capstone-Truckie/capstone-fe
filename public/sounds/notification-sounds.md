# 🔊 Notification Sound Effects

This project uses **ZZFX** - a tiny JavaScript sound generator library for creating rich sound effects without audio files.

## Sound Types

| Type | Description | Use Case | Effect |
|------|-------------|----------|--------|
| **SUCCESS** | Bright power-up sound | Order delivered, payment success | Uplifting chime |
| **INFO** | Soft blip | Status updates, general info | Gentle notification |
| **WARNING** | Alert siren | Cancellations, warnings | Attention-grabbing |
| **ERROR** | Explosion/buzz | Errors, troubles | Urgent alert |
| **PAYMENT_SUCCESS** | Coin collect with shimmer | Payment confirmations | Rewarding chime |
| **NEW_ISSUE** | Notification bell | New issues, incidents | Clear ping |
| **SEAL_CONFIRM** | Click feedback | Confirmations, seal updates | Quick click |

## Implementation

### Basic Usage
```typescript
import { playNotificationSound, NotificationSoundType } from '@/utils/notificationSound';

// Play success sound
playNotificationSound(NotificationSoundType.SUCCESS);

// Play payment sound
playNotificationSound(NotificationSoundType.PAYMENT_SUCCESS);
```

### Customization

Want to customize sounds? Use the **ZzFX Sound Designer**:
https://killedbyapixel.github.io/ZzFX/

1. Design your sound
2. Copy the generated array
3. Update `soundPresets` in `notificationSound.ts`

### Sound Characteristics

#### SUCCESS
```javascript
[1.5,,783,.01,.14,.24,,.63,7.7,3.7,-184,.09,.05]
```
- Frequency: 783Hz (G5 note)
- Shimmer effect with vibrato
- Duration: ~400ms

#### PAYMENT_SUCCESS
```javascript
[1.5,,1046.5,.02,.11,.19,1,1.65,,,,,,5]
```
- Frequency: 1046.5Hz (C6 note)
- Rich harmonic content
- Rewarding "coin collect" feel

#### ERROR
```javascript
[1.3,,77,.03,.08,.15,,.93,,,-302,.08,.16]
```
- Low frequency: 77Hz
- Harsh distortion
- Attention-demanding

## Benefits of ZZFX

✅ **No audio files needed** - All sounds generated programmatically
✅ **Tiny size** - < 1KB minified + gzipped
✅ **No dependencies** - Pure JavaScript
✅ **Customizable** - Easy to modify presets
✅ **Browser compatible** - Works in all modern browsers
✅ **No loading delay** - Instant playback

## References

- ZZFX Library: https://github.com/KilledByAPixel/ZzFX
- Sound Designer: https://killedbyapixel.github.io/ZzFX/
- Documentation: https://github.com/KilledByAPixel/ZzFX#readme
