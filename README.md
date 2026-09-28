# WaterGameConcept

A browser arcade game about protecting clean water, inspired by
[charity: water](https://www.charitywater.org/)'s mission and branding.

📄 **[Read the game plan](docs/GAME_PLAN.md)** — current gameplay, controls, photo options, and
next steps.

🎨 **Visual mockups:**
- [Title screen](assets/title-screen-mockup.svg)
- [Gameplay and face-photo controls](assets/gameplay-mockup.svg)

## Play

Serve the `game/` directory over HTTP and open it in a browser. Use the left and right arrow keys
to move and hold Space to fire both water guns. Shoot falling water to fill the jerrycan; stop mud
before it reaches the ground.

The camera is optional. Choose **Whole face**, **Eyes**, or **Mouth**, select **Take face photo**,
center the chosen area in the preview, then select **Capture face**. The camera is stopped after the
capture. The selected photo is used on the shooter until the page is reloaded; it is not saved.