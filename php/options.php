<div id="m-options">
				<form id="options-form" onsubmit="return false;">
					<div id="options-y">
						<div class="title">Y-Axis</div>

						<select class="field">
							<option value="Temp">Temperature</option>
							<option value="TempDiff">Temperature Difference</option>
							<option value="Celox">Celox</option>
							<option value="Chem">Chemistry</option>
							<option value="ChemDiff" selected>Chemistry Difference</option>
							<option value="SlagChem">Chemistry Slag</option>
							<option value="FurnaceAdd">Furnace Additions</option>
							<option value="Scrap">Furnace Scrap</option>
							<option value="LadleAdd">Ladle Additions</option>
							<option value="Mg90">Desulf Mg90</option>
							<option value="Mg90Replunge">Desulf Mg90 (replunge)</option>
							<option value="DsfSkimWt">Desulf Skim Weight</option>
							<option value="RecycleWt">Recycled Steel Weight</option>
							<option value="TapDur">Tap Duration</option>
							<option value="Degasser">Degasser</option>
						</select>
						<div class="fieldExpand">
							<span class="message"></span>
							<select class="select1"></select>
							<select class="select2"></select>
							<select class="select3"></select>
						</div>

						<div class="dataRange">
							<div class="subtitle">Data Range:</div>
							<input class="min" type="text">
							to
							<input class="max" type="text">
						</div>

					</div>

					<br>

					<div id="options-x">
						<div class="title">X-Axis</div>

						<select class="field">
							<option value="ChargeDTS">Charge Date/Time</option>
							<option value="Temp">Temperature</option>
							<option value="TempDiff">Temp. Difference</option>
							<option value="Celox">Celox</option>
							<option value="Chem">Chemistry</option>
							<option value="ChemDiff">Chemistry Difference</option>
							<option value="SlagChem">Chemistry Slag</option>
							<option value="FurnaceAdd">Furnace Additions</option>
							<option value="Scrap">Furnace Scrap</option>
							<option value="LadleAdd">Ladle Additions</option>
							<option value="Mg90">Desulf Mg90</option>
							<option value="Mg90Replunge">Desulf Mg90 (replunge)</option>
							<option value="DsfSkimWt">Desulf Skim Weight</option>
							<option value="RecycleWt">Recycled Steel Weight</option>
							<option value="TapDur">Tap Duration</option>
							<option value="Degasser">Degasser</option>
						</select>
						<div class="fieldExpand">
							<span class="message"></span>
							<select class="select1"></select>
							<select class="select2"></select>
							<select class="select3"></select>
						</div>

						<div class="dataRange">
							<div class="subtitle">Data Range:</div>
							<input class="min" type="text">
							to
							<input class="max" type="text">
						</div>

						<div class="round">
							<div class="subtitle">Round:</div>
							<input type="text">
						</div>
						
						
					</div>

					<br>

					<div id="options-filter">
						<div class="title">Filters</div>

						
						<div class="dataRange">
							<div class="subtitle">Time Range:</div>
							<input class="min required" type="text">
							to
							<input class="max" type="text">
						</div>

						<div class="tapGrade">
							<div class="subtitle">Tap Grade:</div>
							<input type="text">
						</div>

						<!-- <div class="subtitle">Route:</div>
						<input id="route-ar" type="checkbox" checked>Ar &nbsp;&nbsp;
						<input id="route-rh" type="checkbox" checked>RH &nbsp;&nbsp;
						<input id="route-lmf" type="checkbox" checked>LMF &nbsp;&nbsp;
						
						<div class="subtitle">Multi-Station Route:</div>
						<input id="route-multi" type="checkbox" checked>Allow -->
					</div>

				</form>

				<br>

				<div style="text-align:center;">
					<input id="generate" type="submit" value="Generate Chart">
				</div>

				<br>

				
			</div>