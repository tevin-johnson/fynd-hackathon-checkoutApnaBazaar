import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  LOCATIONS,
  formatLocation,
  resolveLocation,
  searchLocations,
} from '../../lib/locations.ts';

describe('location autocomplete', () => {
  it('empty query gives no suggestions', () => {
    assert.deepEqual(searchLocations(''), []);
    assert.deepEqual(searchLocations('   '), []);
  });

  it('prefix matches come first, case-insensitive', () => {
    const names = searchLocations('pu').map((l) => l.city);
    assert.equal(names[0], 'Puducherry');
    assert.ok(names.includes('Pune'));
    assert.equal(searchLocations('MUM')[0]?.city, 'Mumbai');
  });

  it('matches by state too, and respects the limit', () => {
    const kerala = searchLocations('kerala', 10).map((l) => l.city);
    assert.deepEqual(kerala.sort(), ['Kochi', 'Kozhikode', 'Thiruvananthapuram']);
    assert.ok(searchLocations('a').length <= 6);
  });

  it('unknown text has no suggestions', () => {
    assert.deepEqual(searchLocations('Atlantis'), []);
  });

  it('resolves exact city or canonical text, rejects partials', () => {
    assert.equal(formatLocation(resolveLocation('pune')!), 'Pune, Maharashtra');
    assert.equal(formatLocation(resolveLocation(' Pune, Maharashtra ')!), 'Pune, Maharashtra');
    assert.equal(resolveLocation('pun'), null);
    assert.equal(resolveLocation('Atlantis'), null);
    assert.equal(resolveLocation(''), null);
  });

  it('city list has no duplicates', () => {
    const keys = LOCATIONS.map(formatLocation);
    assert.equal(new Set(keys).size, keys.length);
  });
});
