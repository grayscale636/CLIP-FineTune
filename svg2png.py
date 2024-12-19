import cairosvg
import os

def convert_svg_to_png(input_path, output_path, scale=1):
  cairosvg.svg2png(url=input_path, write_to=output_path, scale=scale)
  print(f"File {input_path} berhasil dikonversi ke {output_path}")

input_folder = "popsy_svg"
output_folder = "popsy_png"

for filename in os.listdir(input_folder):
    if filename.endswith(".svg"):
        input_path = os.path.join(input_folder, filename)
        output_path = os.path.join(output_folder, filename.replace(".svg", ".png"))
        convert_svg_to_png(input_path, output_path, scale=2)