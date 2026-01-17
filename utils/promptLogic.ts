import { CameraState, PromptData } from '../types';

/**
 * Maps numeric camera state to descriptive text prompts.
 * Uses redundant and explicit phrasing to ensure AI models (like Gemini, Midjourney) 
 * strictly adhere to the camera angle.
 * 
 * COORDINATE SYSTEM NOTE:
 * Azimuth 0   = Front (+Z Axis, Camera looks at Front Face)
 * Azimuth 90  = Left Side (+X Axis, Camera looks at Left Profile)
 * Azimuth 180 = Back (-Z Axis, Camera looks at Back)
 * Azimuth 270 = Right Side (-X Axis, Camera looks at Right Profile)
 */
export const generatePrompt = (state: CameraState): PromptData => {
  const { azimuth, polar, distance } = state;

  // normalize azimuth to 0-360
  const normAzimuth = ((azimuth % 360) + 360) % 360;

  let hPrompt = "front view";
  let hDetail = "facing camera";

  // Front: 350 - 10 (Narrower for true front)
  if (normAzimuth >= 350 || normAzimuth < 10) {
    hPrompt = "front view";
    hDetail = "straight-on, symmetrical composition, subject looking directly at camera, face forward";
  }
  // Front-Left (Three Quarter): 10 - 80
  else if (normAzimuth >= 10 && normAzimuth < 80) {
    hPrompt = "three-quarter view from left";
    hDetail = "camera positioned on the left, showing left side of subject, 45-degree angle from front-left";
  }
  // Left Side (Profile): 80 - 100
  else if (normAzimuth >= 80 && normAzimuth < 100) {
    hPrompt = "left side profile";
    hDetail = "90-degree side view, camera strictly on the left, profile shot looking right";
  }
  // Back-Left: 100 - 170
  else if (normAzimuth >= 100 && normAzimuth < 170) {
    hPrompt = "view from behind left";
    hDetail = "rear three-quarter view from left, camera behind left shoulder, showing back and left side";
  }
  // Back: 170 - 190
  else if (normAzimuth >= 170 && normAzimuth < 190) {
    hPrompt = "back view";
    hDetail = "view from behind, straight-on back view, subject facing away";
  }
  // Back-Right: 190 - 260
  else if (normAzimuth >= 190 && normAzimuth < 260) {
    hPrompt = "view from behind right";
    hDetail = "rear three-quarter view from right, camera behind right shoulder, showing back and right side";
  }
  // Right Side (Profile): 260 - 280
  else if (normAzimuth >= 260 && normAzimuth < 280) {
    hPrompt = "right side profile";
    hDetail = "90-degree side view, camera strictly on the right, profile shot looking left";
  }
  // Front-Right (Three Quarter): 280 - 350
  else if (normAzimuth >= 280 && normAzimuth < 350) {
    hPrompt = "three-quarter view from right";
    hDetail = "camera positioned on the right, showing right side of subject, 45-degree angle from front-right";
  }

  let vPrompt = "eye level";
  let vDetail = "neutral height";
  
  if (polar < 30) {
    vPrompt = "bird's eye view";
    vDetail = "overhead shot, camera directly above, top-down perspective";
  } else if (polar < 60) {
    vPrompt = "high angle shot";
    vDetail = "camera looking down at subject, superior angle";
  } else if (polar < 110) { // Expanded eye-level range slightly
    vPrompt = "eye level shot";
    vDetail = "straight angle, camera at subject's eye height";
  } else if (polar < 150) {
    vPrompt = "low angle shot";
    vDetail = "camera looking up at subject, inferior angle, heroic angle";
  } else {
    vPrompt = "worm's eye view";
    vDetail = "ground level shot, camera directly below, looking straight up";
  }

  let dPrompt = "medium shot";
  if (distance < 3) dPrompt = "extreme close-up, macro shot, detailed texture";
  else if (distance < 5) dPrompt = "close-up, face focus, headshot";
  else if (distance < 9) dPrompt = "medium shot, waist-up, mid-shot";
  else if (distance < 14) dPrompt = "cowboy shot, american shot, knees-up";
  else if (distance < 20) dPrompt = "full body shot, wide shot, entire figure visible";
  else dPrompt = "extreme wide shot, long shot, establishing shot, subject small in frame";

  // Construct strongly worded prompt for AI coherence
  const detailedPrompt = `(camera angle: ${hPrompt}, ${vPrompt}), ${hDetail}, ${vDetail}, ${dPrompt}, distance ${distance}m, azimuth ${Math.round(normAzimuth)}°, elevation ${Math.round(polar)}°`;

  return {
    horizontal: hPrompt,
    vertical: vPrompt,
    distance: dPrompt.split(',')[0], // Brief label
    fullPrompt: detailedPrompt
  };
};