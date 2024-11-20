/**
 * Example without using open-closed principle
 */

class Weapon {
    type: string;
    damage: number;
    range: number;

    constructor(type: string, damage: number, range: number) {
        this.type = type;
        this.damage = damage;
        this.range = range;
    }

    attack() {
        // This conditional logic violates the OCP:
        // - Adding a new weapon type requires modifying this method.
        // - The class is not "closed for modification" and is harder to maintain.
        if (this.type === 'sword') {
            console.log(`Attack with sword ${this.damage}`);
        } else if (this.type === 'crossbow') {
            console.log(`Attack with crossbow ${this.damage}`);
        }
    }
}

class Character {
    private name: string;
    private weapon: Weapon;

    constructor(name: string, weapon: Weapon) {
        this.name = name;
        this.weapon = weapon;
    }

    public changeWeapon(newWeapon: Weapon) {
        this.weapon = newWeapon;
    }

    public attack() {
        // Delegates the attack to the weapon, but the Weapon class still violates OCP.
        this.weapon.attack();
    }
}

const sword = new Weapon('sword', 15, 2);
const character = new Character('warrior', sword);
character.attack();

const crossbow = new Weapon('crossbow', 10, 15);
character.changeWeapon(crossbow);
character.attack();

/**
 * Example with Open-Closed Principle
 */

interface Attacker {
    // Defines an interface for attacking behavior.
    // This ensures the attack logic can be extended without modifying the base types.
    attack: () => void;
}

class Weapon2 implements Attacker {
    type: string;
    damage: number;
    range: number;

    constructor(type: string, damage: number, range: number) {
        this.type = type;
        this.damage = damage;
        this.range = range;
    }

    // A base class can optionally define a generic attack method.
    // Concrete subclasses will override this to provide specific behavior.
    attack() {
    }
}

class Sword extends Weapon2 {
    // This subclass adds specific logic for "Sword" attack.
    // Adding a new weapon does not require modifying existing classes.
    attack() {
        console.log(`Melee attack with damage ${this.damage} by ${this.type}`);
    }
}

class Crossbow extends Weapon2 {
    // This subclass adds specific logic for "Crossbow" attack.
    // Extending the system is now straightforward and conforms to OCP.
    attack() {
        console.log(`Range attack with damage ${this.damage} by ${this.type}`);
    }
}

const sword2 = new Sword('sword', 15, 2);
const character2 = new Character('warrior', sword2);
character2.attack();

const crossbow2 = new Crossbow('crossbow', 10, 15);
character2.changeWeapon(crossbow2);
character2.attack();

/**
 * Why the second example conforms to OCP:
 * 1. **Extension without modification:** Adding new weapons (e.g., Axe, Spear) is done by creating new subclasses.
 *    - No changes are needed in the existing codebase.
 * 2. **Encapsulation of behavior:** Each weapon encapsulates its own attack logic.
 * 3. **Interfaces for flexibility:** The `Attacker` interface ensures that all weapon types adhere to a common contract,
 *    enabling polymorphism and promoting future extensibility.
 */
