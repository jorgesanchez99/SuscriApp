const regex = /^[a-zA-ZÀ-ÿ\u00f1\u00d10-9\s\-_.&()[\]]+$/;
const names = [
  'Netflix Premium',
  'Amazon Prime Video', 
  'Spotify (Family)',
  'Office 365',
  'PlayStation Plus',
  'Disney+ & Hulu'
];

console.log('Testing regex validation:');
names.forEach((name, i) => {
  const result = regex.test(name);
  console.log(`${i+1}. '${name}' -> ${result}`);
  if (!result) {
    console.log(`   Failed character: ${name.split('').find(char => !regex.test(char))}`);
  }
});
