import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { AlphaMode, Appearance } from '@microsoft/mixed-reality-extension-sdk';

export default class XRay{

	private assets: MRE.AssetContainer;
	private text: MRE.Actor = null;
	private model: MRE.Actor = null;
	private mat: MRE.Material = null;

	private alphaValue = 0.9;

	private sliderPuck: MRE.Actor = null;
	private btnIncrease: MRE.Actor = null;
	private btnDecrease: MRE.Actor = null;

	constructor(private context: MRE.Context){
		this.context.onStarted(() => this.started());
	}


	private async started(){
		this.assets = new MRE.AssetContainer(this.context);

		const modelData = await this.assets.loadGltf('donia.glb', 'box');
		this.mat = this.assets.materials[0];

		const enterMat =this.assets.createMaterial('enterMat',{
			color: { r: 1, g: 1, b: 1, a: 1 }
		})

		const exitMat =this.assets.createMaterial('exitMat',{
			color: { r: 1, g: 1, b: 1, a: 1 }
		})

		this.text = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					local: { position: { x: 0.5, y: -0.5, z: 0 } }
				},
				text: {
					contents: "XRay controller",
					anchor: MRE.TextAnchorLocation.BottomCenter,
					color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
					height: 0.3
				}
			}
		});

		//model
		this.model = MRE.Actor.CreateFromPrefab(this.context, {
			firstPrefabFrom: modelData,
			actor :
			{
				name: 'Donia',
				parentId: this.text.id,
				transform:{
					local:{
						scale:{ x: 100, y: 100, z: 100 },
						position:{ x: 0, y: 0.7, z: 0 },
						rotation:{ x: 0, y: 90, z: 0 }
					}
				},
				appearance: 
				{
					materialId: this.mat.id
				}
			}
		});


		//increase button
		this.btnIncrease = MRE.Actor.CreatePrimitive(this.assets, {
			definition: {shape: MRE.PrimitiveShape.Box},
			actor:{
				name: 'increaseButton',
				transform:{
					local:{
						position:{ x: 1.3, y: 0, z: 0 },
						scale:{ x: 0.3, y: 0.3, z: 0.01 },
						rotation: MRE.Quaternion.Zero()
					},
				},
				appearance:{
					materialId: enterMat.id
				}
			},
			addCollider: true
		})

		//slider puck
		this.sliderPuck = MRE.Actor.CreatePrimitive(this.assets, {
			definition: {shape: MRE.PrimitiveShape.Box},
			actor:{
				name: 'sliderPuck',
				transform:{
					local:{
						position:{ x: 1, y: 0, z: 0 },
						scale:{ x: 0.1, y: 0.15, z: 0.01 },
						rotation: MRE.Quaternion.Zero()
					}
				},
			},
			addCollider: true
		})		

		//increase button
		this.btnDecrease = MRE.Actor.CreatePrimitive(this.assets, {
			definition: {shape: MRE.PrimitiveShape.Box},
			actor:{
				name: 'decreaseButton',
				transform:{
					local:{
						position:{ x: -0.3, y: 0, z: 0 },
						scale:{ x: 0.3, y: 0.3, z: 0.01 },
						rotation: MRE.Quaternion.Zero()
					}
				},
				appearance:{
					materialId: exitMat.id
				}
			},
			addCollider: true
		})

		//slider bar
		const slider = MRE.Actor.CreatePrimitive(this.assets,{
			definition: {shape: MRE.PrimitiveShape.Box},
			actor:{
				name: 'slideerBar',
				transform:{
					local:{
						position:{ x: 0.5, y: 0, z: 0 },
						scale:{ x: 0.05, y: 0.01, z: 1 },
						rotation: MRE.Quaternion.FromEulerAngles(
							180 * MRE.DegreesToRadians, 90 * MRE.DegreesToRadians, -90 * MRE.DegreesToRadians),
					}
				},
			},
			addCollider: true
		})

		///holding event
		const onIncrease = this.btnIncrease.setBehavior(MRE.ButtonBehavior).onButton(
			'holding', (User, data) => { 
				this.incraseAlpha(User);
			});
		
		onIncrease.onHover('enter', () =>{
			enterMat.color.r = 0;
			enterMat.color.g = 1;
			enterMat.color.b = 0;
			enterMat.color.a = 1;
		})

		onIncrease.onHover('exit', () =>{
			enterMat.color.r = 1;
			enterMat.color.g = 1;
			enterMat.color.b = 1;
			enterMat.color.a = 1;
		})
		
		const onDecrease = this.btnDecrease.setBehavior(MRE.ButtonBehavior).onButton(
			'holding', (User, data) =>{ 
				this.decreaseAlpha(User);
			});

			onDecrease.onHover('enter', () =>{
			exitMat.color.r = 1;
			exitMat.color.g = 0;
			exitMat.color.b = 0;
			exitMat.color.a = 1;
		})
	
		onDecrease.onHover('exit', () =>{
			exitMat.color.r = 1;
			exitMat.color.g = 1;
			exitMat.color.b = 1;
			exitMat.color.a = 1;
		})
	}

	private incraseAlpha(User: MRE.User){
		this.alphaValue += 0.1 ;

		this.mat.color.a = this.alphaValue;

		this.sliderPuck.transform.local.position.x = this.alphaValue;

		if(this.alphaValue >= 0.9){
			this.alphaValue = 0.9;
			this.mat.alphaMode = AlphaMode.Opaque;
		}
	}

	//decrease method
	private decreaseAlpha(user: MRE.User){
		if (this.mat.alphaMode === AlphaMode.Opaque) {
			this.mat.alphaMode = AlphaMode.Blend;
		}

		this.alphaValue -= 0.1 ;

		this.mat.color.a = this.alphaValue;

		this.sliderPuck.transform.local.position.x = this.alphaValue;

		if(this.alphaValue <= 0.3){
			this.alphaValue = 0.3;
		}
	}

	//Normlaize values
	private normalize(min: number, max: number, input: number){
		return (input - min) / (max - min);
	}
}
