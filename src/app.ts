import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { AlphaMode, Appearance } from '@microsoft/mixed-reality-extension-sdk';

export default class XRay{

	private assets: MRE.AssetContainer;
	private text: MRE.Actor = null;
	private model: MRE.Actor = null;
	private mat: MRE.Material = null;

	private slider: MRE.Actor = null;
	private sliderPuck: MRE.Actor = null;
	constructor(private context: MRE.Context){
		this.context.onStarted(() => this.started());
	}


	private async started(){
		this.assets = new MRE.AssetContainer(this.context);

		const modelData = await this.assets.loadGltf('donia.glb', 'box');
		this.mat = this.assets.materials[0];

		this.text = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					local: { position: { x: 0, y: -0.5, z: 0 } }
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

		//slider bar
		this.slider = MRE.Actor.CreatePrimitive(this.assets,{
			definition: {shape: MRE.PrimitiveShape.Box},
			actor:{
				name: 'sliderBar',
				transform:{
					local:{
						position:{ x: 0, y: 0, z: 0 },
						scale:{ x: 1, y: 0.05, z: 0.01 },
					}
				},
			},
			addCollider: true
		})

		//slider puck
		this.sliderPuck = MRE.Actor.CreatePrimitive(this.assets, {
			definition: {shape: MRE.PrimitiveShape.Box},
			actor:{
				name: 'sliderPuck',
				parentId: this.slider.parentId,
				transform:{
					local:{
						position:{ x: 0.5, y: 0, z: 0 },
						scale:{ x: 0.1, y: 0.15, z: 0.01 },
						rotation: MRE.Quaternion.Zero()
					}
				},
			},
			addCollider: true
		})

		const seekSlider = this.slider.setBehavior(MRE.ButtonBehavior).onButton(
			'holding', (User, data) =>{
				data.targetedPoints.forEach((pointData) => {
					const pos = { transform: { local: { position: { x: pointData.localSpacePoint.x, y: 0, z: 0 } } } };
					this.sliderPuck.animateTo(pos, 0.01, MRE.AnimationEaseCurves.Linear);
					this.setAlphaValue(User, pos.transform.local.position.x);
				});
			}
		)
	}

	private setAlphaValue(User: MRE.User, pos: number){
		const posNorm = this.normalize(-0.5, 0.5, pos);

		if (this.mat.alphaMode === AlphaMode.Opaque && posNorm <= 0.95) {
			this.mat.alphaMode = AlphaMode.Blend;
		}else if(posNorm >= 0.96){
			this.mat.alphaMode = AlphaMode.Opaque;
		}

		this.mat.color.a = posNorm;
	}

	//Normlaize values
	private normalize(min: number, max: number, input: number){
		return (input - min) / (max - min);
	}
}
