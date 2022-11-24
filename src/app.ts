import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { Actor, AlphaMode } from '@microsoft/mixed-reality-extension-sdk';

export default class EnableDisable{

	private assets: MRE.AssetContainer;
	private model: MRE.Actor = null;
	private mat: MRE.Material = null;

	private increase: MRE.Actor;
	private decrease: MRE.Actor;

	constructor(private context: MRE.Context){
		this.context.onStarted(() => this.started());
	}

	private async started(){
		this.assets = new MRE.AssetContainer(this.context);

		const modelData = await this.assets.loadGltf('donia.glb', 'box');
		this.mat = this.assets.materials[0];

		this.model = MRE.Actor.CreateFromPrefab(this.context, {
			firstPrefabFrom: modelData,
			actor :
			{
				name: 'Donia',
				transform:{
					local:{
						scale:{
							x: 100, 
							y: 100, 
							z: 100
						},
						position:{
							x: 1.5, 
							y: -1.2, 
							z: 0
						},
						rotation:{
							x: 0, 
							y: 90, 
							z: 0
						}
					}
				},
				appearance: 
				{
					materialId: this.mat.id
				}
			}
		});

		this.increase = MRE.Actor.CreatePrimitive(this.assets,
			{
				definition: {shape: MRE.PrimitiveShape.Box},
				actor:{
					transform:{
						local:{
							position:{
								x: 0.6,
								y: 0, 
								z: 0
							},
							scale:{
								x: 1, 
								y: 1, 
								z: 0.1
							}
						}
					},
				},
				addCollider: true
			});

		this.decrease = MRE.Actor.CreatePrimitive(this.assets,
			{
				definition: {shape: MRE.PrimitiveShape.Box},
				actor:{
					transform:{
						local:{
							position:{
								x: -0.6,
								y: 0,
								z: 0
							},
							scale:{
								x: 1,
								y: 1,
								z: 0.1
							}
						}
					},
				},
				addCollider: true
			});

		this.increase.created().then(() => 
			this.increase.setBehavior(MRE.ButtonBehavior).onClick((User) => this.incraseAlpha(User)))

		this.decrease.created().then(() => 
			this.decrease.setBehavior(MRE.ButtonBehavior).onClick((User) => this.decreaseAlpha(User)))
	}

	private incraseAlpha(user: MRE.User){
		if (this.mat.alphaMode === AlphaMode.Opaque) {
			this.mat.alphaMode = AlphaMode.Blend;
			console.log("Defualt " + this.mat.color.a);
		}
		
		this.mat.color.a -= 0.1;
		
		if (this.mat.color.a <= 0.5) {
			this.mat.color.a = 0.5;
			console.log("Estableciendo valor a 0.5");
		}
	}

	private decreaseAlpha(user: MRE.User){
		this.mat.color.a += 0.1;
		if (this.mat.color.a >= 1) {
			this.mat.color.a = 1;
			this.mat.alphaMode = AlphaMode.Opaque;
		}
	}
}
