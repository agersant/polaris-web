<template>
	<div class="h-full flex flex-col bg-ls-50 dark:bg-ds-900">
		<div class="flex flex-1 min-h-0">
			<Sidebar class="m-8 mr-0" />

			<div class="flex grow">
				<div class="grow basis-0 min-w-0 mx-20 my-8 flex">
					<router-view class="grow"></router-view>
				</div>

				<div class="grow basis-0 min-w-0 flex flex-col border-l">
					<div class="m-8 flex items-center justify-between">
						<div class="flex items-center">
							<span class="text-4xl mb-2 mr-2 font-light">Cozy</span>
							<Button label="Save" size="small" severity="secondary" text>
								<template #icon>
									<span class="material-icons-round">save</span>
								</template>
							</Button>
							<Button label="Clear" size="small" severity="secondary" text>
								<template #icon>
									<span class="material-icons-round">clear</span>
								</template>
							</Button>
						</div>
						<div class="flex items-center gap-4">
							<Button label="Shuffle" severity="secondary" text>
								<template #icon>
									<span class="material-icons-round">shuffle</span>
								</template>
							</Button>
							<Select placeholder="Repeat All" />
						</div>
					</div>
					<div class="min-h-0">
						<DataTable :value="playlist" scrollable scrollHeight="flex" stripedRows class="text-xs"
							size="small">
							<!-- TODO more subtle drag handle -->
							<Column rowReorder headerStyle="width: 3rem" />
							<!-- TODO album art -->
							<Column field="artist" header="Artist"></Column>
							<Column field="album" header="Album"></Column>
							<Column field="title" header="Title"></Column>
						</DataTable>
					</div>
				</div>
			</div>
		</div>
		<div class="h-28 px-8 py-6 border-t flex-none flex items-center gap-16">
			<div class="flex">
				<div class="aspect-square h-20 rounded-md bg-pink-400" />
				<div class="ml-4 flex flex-col justify-center">
					<div class="font-semibold">No Turning Back</div>
					<div class="text-sm text-muted-color">Stratovarius</div>
				</div>
			</div>
			<div class="flex gap-4 items-center text-muted-color">
				<span class="material-icons-round text-4xl">skip_previous</span>
				<div class="material-icons-round text-2xl rounded-full p-2 border-4 px-3">pause</div>
				<span class="material-icons-round text-4xl">skip_next</span>
			</div>
			<div class="grow flex items-center gap-4 text-muted-color text-xs">
				<span>0:24</span>
				<div id="waveform" class="grow" />
				<span>5:46</span>
			</div>
			<div class="flex items-center gap-4">
				<span class="material-icons-round">volume_down</span>
				<Slider class="w-32" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WaveSurfer from 'wavesurfer.js'

import { makeAudioURL } from '@/api/endpoints';
import Sidebar from './Sidebar.vue';

onMounted(() => {
	WaveSurfer.create({
		container: '#waveform',
		url: makeAudioURL("root/Jazz/Casiopea/1981 - Cross Point/02 - Swear.mp3"),
		// waveColor: $dt("text.muted.color").value.light.value,
		// progressColor: $dt("primary.color").value.light.value,
		height: 112,
		barWidth: 3,
		barGap: 2,
		barRadius: 4,
		barHeight: 0.5,
		cursorWidth: 0,
	})
});

const playlist = [
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 1, title: "Northwind" },
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 2, title: "Waltz with the Dead" },
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 3, title: "Spirit of the Hawk" },
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 4, title: "Legend and the Lore" },
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 5, title: "Catch the Shadows" },
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 6, title: "Tower of the Queen" },
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 7, title: "Long Gone By" },
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 8, title: "Perjury and Sanctity" },
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 9, title: "Fairyland Fanfare" },
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 10, title: "Himmel sa trind" },
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 11, title: "Blinded" },
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 12, title: "Delusion" },
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 13, title: "Home of the Knave" },
	{ artist: "Falconer", album: "Northwind", year: 2006, trackNumber: 14, title: "Black Tarn" },
	{ artist: "Stratovarius", album: "Destiny", year: 1998, trackNumber: 1, title: "Destiny" },
	{ artist: "Stratovarius", album: "Destiny", year: 1998, trackNumber: 2, title: "S.O.S." },
	{ artist: "Stratovarius", album: "Destiny", year: 1998, trackNumber: 3, title: "No Turning Back" },
	{ artist: "Stratovarius", album: "Destiny", year: 1998, trackNumber: 4, title: "4000 Rainy Nights" },
	{ artist: "Stratovarius", album: "Destiny", year: 1998, trackNumber: 5, title: "Rebel" },
	{ artist: "Stratovarius", album: "Destiny", year: 1998, trackNumber: 6, title: "Years Go By" },
	{ artist: "Stratovarius", album: "Destiny", year: 1998, trackNumber: 7, title: "Playing With Fire" },
	{ artist: "Stratovarius", album: "Destiny", year: 1998, trackNumber: 8, title: "Venus in the Morning" },
	{ artist: "Stratovarius", album: "Destiny", year: 1998, trackNumber: 9, title: "Anthem of the World" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 1, title: "Stargazer" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 2, title: "Undying" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 3, title: "In The Walls" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 4, title: "The Tale of Deathface Ginny" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 5, title: "Castles in the Snow" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 6, title: "Kingslayer" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 7, title: "The Faceless Hero" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 8, title: "Neverending" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 9, title: "Hollow" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 10, title: "Awakened From Nothing" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 11, title: "In The Walls (EP Version)" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 12, title: "Undying (EP Version)" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 13, title: "The Bloody Meadow (Re-Recording)" },
	{ artist: "Seven Kingdoms", album: "Decennium", year: 2017, trackNumber: 14, title: "Stormborn (Re-Recording)" },
];

</script>
