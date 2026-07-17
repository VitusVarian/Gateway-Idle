Game Name: Gateway of Darkness Idle
Quick Idea: Idle style game incorporating RPG elements, "prestige" levels, and multiple upgrade paths.
More Information: Web browser based game, intended for desktop, slow paced idle game, gain stats/attributes, fight monsters, gain levels, grow stronger, upgrade weapon, "reset" to gain meta upgrades to speed up the next loop.

Core Attributes:
`Strength` - default: 1, gain `StrengthGrowth` per `Level`, affects `BaseDamage`, 1 `Strength` = +1 `BaseDamage`
`Level` - default: 1, gain 1 `Level` when `Experience` reaches or exceeds `ExperienceToLevel`, increments `Strength` and `Endurance`
`Experience` - default: 0, winning a fight against a monster awards `ExperienceGain` points to `Experience` 

Resources:
`MonsterSoul` - default: 0, winning a fight against a monster awards `MonsterSoulGain` points to `MonsterSoul`, these are spent on WEAPON attributes 
`TrainingPoint` - default: 0, this is the first type of "prestige" currency, it can be spent on `LevelingDifficulty`, `StrengthGrowth`, `EnduranceGrowth`, `ExperienceModifier`

Prestige Upgradable Attributes:
`StrengthGrowth` - default: 1, each `TrainingPoint` invested in this attribute increases the value by 1 (additive)
`LevelingDifficulty` - default: 2.0, each `TrainingPoint` invested in this attribute decreases the value by 0.1, maximum of 10 upgrades
`ExperienceModifier` - default: 1.0, each `TrainingPoint` invested in this attribute increases the value by 0.01 
`MonsterSoulModifier` - default: 1.0, each `TrainingPoint` invested in this attribute increases the value by 0.01

Weapon Attributes:
`DamageMultiplier` - default: 1.0, this is part of the battle equations to determine `DamageDealt`, increases by 0.1 for every `WeaponUpgradeLevel`
`WeaponUpgradeCost` = FLOOR(`WeaponBaseCost` * `WeaponCostGrowthRate` ^ `WeaponUpgradeLevel`)
`WeaponBaseCost` - default: 50
`WeaponCostGrowthRate` - deault: 1.1
`WeaponUpgradeLevel` - default: 0, increments +1 every time the user upgrades the damage multiplier

Battle Equations / Context:
Player attacks monster, animation shows attacks, battle runs until the monster is defeated (brought to or below 0 Hit Points) or the player chooses to fight another monster
`DamageDealt` = FLOOR((`BaseDamage` * `DamageMultiplier`) / `MonsterDifficultyModifier`) 
`MonsterHitPoints` = FLOOR(`MonsterBaseHitPoints` * (`MonsterLevel` * `MonsterCoefficient` + `MonsterGrowthRate` ^ `MonsterLevel`))
`MonsterBaseHitPoints` - default: 10
`MonsterCoefficient` - default: 2
`MonsterGrowthRate` - default: 1.08
`ExperienceToLevel` - when a character accumulates `Experience` that matches or exceeds this equation their level gets incremented (along with other attributes) and `Experience` is reset to 0. Do not void the excess if there is more than enough to level up - instead use it to apply to the next level. A character could potentially gain enough experience from 1 fight to level up multiple times, `ExperienceToLevel` = FLOOR(20 * `Level`^`LevelingDifficulty`)
`ExperienceGain` - this is the awarded experience equation for beating a monster, `ExperienceGain` = FLOOR(10 * `MonsterLevel` * `ExperienceModifier`)
`MonsterSoulGain` - this is the awarded monstersoul equation for beating a monster, `MonsterSoulGain` = FLOOR(10 * `MonsterLevel` * `MonsterSoulModifier`)
`MonsterLevel` - this is the level of the monster
`AttackSpeedBase` - default: .8

Layout:
Game has 3 rows
Top row is navigation, small, by default only displays Armory link and on the far right an options link. TO the left of the options link, display an Achievements link
Middle row and bottom row split the remaining screen space
middle row show the Battle screen
Bottom row shows the screen information for the location selected from navigation
After the player reaches level 10, a new link appears to the right of Armory - "Training"

Battle Screen:
Player must beat 10 monsters at level x before being allowed to monster level x+1
After a monster battle, there is a 3 second cool down before the next monster battle begins
A player can choose to advance or back track with arrows at the top of the battle area at any time
The advance arrow will not display if the player does not have the required victories at the current stage
There will be a check box to auto advance to next stage when you clear the current stage
There will be a stage counter in the top middle
There is an animation of the player character (left side) fighting the monster (right side). Player attack animations plays every `AttackSpeedBase` seconds and deals damage at the same time
If a player beats a monster, award `ExperienceGain` and `MonsterSoulGain`, do level up if needed
On the left of the player character, show a field with an "DPS: `DPSvalue`" 
`DPSvalue` = FLOOR(`DamageDealt` * `AttackSpeedBase`)
On the right of the monster, show a vertical Health bar and update the values as the monster takes hits

Armory Screen:
Image of weapon on left, Current `DamageMultiplier` value to the right of that, current level of the upgrade to the right of that
under that row, a button with "Upgrade: `WeaponUpgradeCost`"
When clicked, if the player has enough `MonsterSoul`, remove that number of `MonsterSoul` and increase the level of `WeaponUpgradeLevel`. If there isn't enough `MonsterSoul`, display a warning message "Not enough souls!"

Training Screen:
Message at top - "You've gained enough experience to learn x `TrainingPoint` to further your goals. Warning - If you take time to train, you will lose your battle progress and revert to level 1 with base stats."
Increment the value based on the current MilestoneLevel
Under that message, include a button "Start Training?"
When clicked, reset the character to level 1, Strength 1, WeaponUpgradeLevel 1, Experience 0, award `TrainingPoint` based on the maximum character level reached based on the MilestoneReward
There should be a record somewhere with a tally of the number of times a user has reset with a Training and a total number of Training Points
After the first time a player clicks the button, the link to Training screen always displays.
After the first time a player click the button, the Training screen displays a table at the bottom of the screen with a list of : 
Prestige Upgradeable Attributes | Current Value | Button to upgrade containing the cost in `TrainingPoint`

MilestoneLevel(n) = FLOOR(FirstMilestone * MilestoneSpacing^(n-1))
FirstMilestone = 10
MilestoneSpaceing = 1.6
MilestoneReward(n) = FLOOR(BaseReward + RewardCoeff * SQRT(n))
BaseReward = 1
RewardCoeff = 2

Options Screen:
Save button
Load button
FULL RESET button

Save button generates a base64 encoded string of the current game state in a text field next to it. QUESTION: Can this be salted to avoid tampering? Or some other process?
Load button shows a text field next to it. A player can paste in a base64 encoded string to load a game state. Included a confirmation
Full reset button, include confirmation with dire warning that clicking affirmative will reset the progress of the game completely back to the beginning.

Achievement Screen:
Grid layout, 5 wide, contains an image and a description of the unlock criteria. _Can_ contain another line with a reward. Not all achievements has rewards. Make them greyed out when not unlocked and colorful when unlocked

OTHER:
Game needs to autosave progress locally every 5 minutes
Game will likely contain big numbers - Make sure to include a library that can handle them and be performant
