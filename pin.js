// drag_and_drop.js

document.addEventListener("DOMContentLoaded", () => {
  const bossRows = document.querySelectorAll(".boss-row");
  const pinButtons = document.querySelectorAll(".pin-btn");
  const dropTarget = document.getElementById("drop-target");
  const dropEmptyIndicator = document.getElementById("drop-empty-indicator");

  // Collect all valid boss names
  const validBossNames = Array.from(data.boss_weaknesses).map(row => row.boss);

  // Make boss rows draggable
  bossRows.forEach((row) => {
    row.addEventListener("dragstart", (event) => {
      // Store the boss name in the dataTransfer object
      const bossName = event.target.dataset.bossName;
      event.dataTransfer.setData("text/plain", bossName);
      console.log(`Dragging: ${bossName}`);
    });
  });

  pinButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      // bossname is in the data-boss-name attribute of the button
      const bossName = event.currentTarget.dataset.bossName;
      if (validBossNames.includes(bossName)) {
        pinStats(bossName); // Call the function to pin stats
      } else {
        console.error(`Invalid boss name clicked: ${bossName}`);
      }
    });
  });

  // Prevent default to allow dropping
  dropTarget.addEventListener("dragover", (event) => {
    event.preventDefault();
    // Optional: Add visual feedback for drag over
    dropTarget.classList.add("border-purple-500");
  });

  // Remove visual feedback when drag leaves
  dropTarget.addEventListener("dragleave", () => {
    dropTarget.classList.remove("border-purple-500");
  });

  // Handle the drop event
  dropTarget.addEventListener("drop", (event) => {
    event.preventDefault();
    dropTarget.classList.remove("border-purple-500"); // Remove visual feedback

    const bossName = event.dataTransfer.getData("text/plain");
    if (bossName && validBossNames.includes(bossName)) {
      pinStats(bossName); // Call the function to pin stats
    } else {
      console.error(`Invalid boss name dropped: ${bossName}`);
    }
  });

  // Validates boss name and retrieves boss data
  function validateAndGetBossData(bossName) {
    if (!validBossNames.includes(bossName)) {
      console.error(`Invalid boss name: ${bossName}`);
      return null;
    }

    const bossData = data.boss_weaknesses.find(row => row.boss === bossName);
    if (!bossData) {
      console.error(`No data found for boss: ${bossName}`);
      return null;
    }

    return bossData;
  }

  // Parses icon strings like "#fire#holy#frenzy" and creates image elements
  function createIconsFromString(iconString) {
    const iconContainer = document.createElement('div');
    const iconKeys = iconString ? iconString.split('#').filter(k => k) : [];
    iconContainer.className = `grid grid-cols-${Math.min(iconKeys.length || 1, 5)} gap-1`;

    iconKeys.forEach(key => {
      const img = document.createElement('img');
      img.src = key + '.webp';
      img.className = 'inline-block w-5 h-5 align-middle flex-shrink-0 min-w-5 min-h-5';
      iconContainer.appendChild(img);
    });

    return iconContainer;
  }

  // Creates the header section with boss name and icons
  function createBossHeader(bossName, weaknessString, damageString) {
    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex gap-x-4 mb-3 items-end';

    const title = document.createElement('div');
    title.className = 'font-bold text-2xl max-w-fit truncate';
    title.textContent = bossName;

    // Weakness section
    const weaknessSection = document.createElement('div');
    weaknessSection.className = 'flex items-end gap-x-1';
    const weaknessLabel = document.createElement('span');
    weaknessLabel.textContent = 'Weakness:';
    weaknessLabel.className = 'mr-1';
    const weaknessIcons = createIconsFromString(weaknessString);
    weaknessSection.appendChild(weaknessLabel);
    weaknessSection.appendChild(weaknessIcons);

    // Dealt Damage section using createIconsFromString
    const damageSection = document.createElement('div');
    damageSection.className = 'flex items-end gap-x-1';

    const damageLabel = document.createElement('span');
    damageLabel.textContent = 'Deals:';
    damageLabel.className = 'mr-1';

    const damageIcons = createIconsFromString(damageString);

    damageSection.appendChild(damageLabel);
    damageSection.appendChild(damageIcons);

    headerDiv.appendChild(title);
    headerDiv.appendChild(weaknessSection);
    headerDiv.appendChild(damageSection);
    // add x button to remove pinned stat
    const removeButton = document.createElement('button');
    removeButton.className = 'ml-auto text-gray-600 hover:text-red-900 transition flex items-start cursor-pointer self-start';
    removeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  `;
    removeButton.addEventListener('click', () => {
      removePinnedStat();
    });
    headerDiv.appendChild(removeButton);

    return headerDiv;
  }

  function getPercentClass(val) {
    if (val === '+0%') return '';
    const num = parseInt(val.replace('%', ''));
    if (num >= 25 && val.includes('+')) return 'text-green-500 font-bold';
    if (num >= 10 && val.includes('+')) return 'text-green-300';
    if (num <= -30) return 'text-red-500';
    if (num <= -10) return 'text-red-300';
    return '';
  };
  function getStatusClass(val) {
    if (val === '154') return 'text-green-500';
    if (val === '252') return 'text-yellow-500';
    if (val === '541') return 'text-orange-500';
    if (val === 'Immune') return 'text-red-500';
    return '';
  };

  function createWeaknessGrid(bossData) {
    const gridDiv = document.createElement('div');
    gridDiv.className = 'grid grid-cols-5 grid-rows-3 gap-2';

    const weaknessKeys = ["standard", "slash", "strike", "pierce", "magic", "fire", "lightning", "holy", "bleed", "frostbite", "poison", "rot", "sleep", "frenzy"];
    const keysWithoutIcons = ["standard", "slash", "strike", "pierce"];

    weaknessKeys.forEach(key => {
      const cellDiv = document.createElement('div');
      cellDiv.className = 'rounded overflow-hidden bg-gray-700 transition-colors';

      const keyDiv = document.createElement('div');
      keyDiv.className = 'font-semibold text-center flex items-center justify-center bg-gray-900 py-1';

      // Check if this key should have an icon
      if (!keysWithoutIcons.includes(key)) {
        const keyIcon = document.createElement('img');
        keyIcon.src = key + '.webp';
        keyIcon.className = 'inline-block w-5 h-5 align-middle mr-1';
        keyDiv.appendChild(keyIcon);
      } else {
        const keyText = document.createElement('span');
        keyText.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        keyDiv.appendChild(keyText);
      }

      const valueDiv = document.createElement('div');
      valueDiv.textContent = bossData[key] || '';
      // Add color based on value
      if (["bleed", "frostbite", "poison", "rot", "sleep", "frenzy"].includes(key)) {
        valueDiv.className = 'text-center p-1 ' + getStatusClass(bossData[key]);
      } else {
        valueDiv.className = 'text-center p-1 ' + getPercentClass(bossData[key]);
      }

      cellDiv.appendChild(keyDiv);
      cellDiv.appendChild(valueDiv);
      gridDiv.appendChild(cellDiv);
    });

    return gridDiv;
  }

  // Handles DOM manipulation and displays the pinned stats
  function displayPinnedStat(pinnedStatElement) {
    const pinnedStatsContainer = document.getElementById("pinned-stats");

    pinnedStatsContainer.innerHTML = '';
    pinnedStatsContainer.appendChild(pinnedStatElement);
    pinnedStatsContainer.classList.remove('hidden');
    dropEmptyIndicator.classList.add('hidden');
  }

  // Removes the pinned stat from the display
  function removePinnedStat() {
    const pinnedStatsContainer = document.getElementById("pinned-stats");
    pinnedStatsContainer.innerHTML = '';
    pinnedStatsContainer.classList.add('hidden');
    dropEmptyIndicator.classList.remove('hidden');

    console.log("Pinned stats removed.");
  }

  // Creates the main pinned stat container
  function createPinnedStatContainer(headerElement, gridElement) {
    const pinnedStat = document.createElement("div");
    pinnedStat.className = "pinned-stat bg-gray-800 p-4 rounded-lg mb-2";

    pinnedStat.appendChild(headerElement);
    pinnedStat.appendChild(gridElement);

    return pinnedStat;
  }

  // Main orchestrator function
  function pinStats(bossName) {
    const bossData = validateAndGetBossData(bossName);
    if (!bossData) return;

    const headerElement = createBossHeader(bossName, bossData.weakness, bossData.dealt_damage);
    const gridElement = createWeaknessGrid(bossData);
    const pinnedStatElement = createPinnedStatContainer(headerElement, gridElement);

    displayPinnedStat(pinnedStatElement);

    console.log(`Pinned stats for: ${bossName}`);
  }

});
