import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Spin, Alert, Space, Card, Row, Col } from "antd";
import {
  EyeOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

interface PackageDetail {
  orderDetailId: string;
  x: number;
  y: number;
  z: number;
  length: number;
  width: number;
  height: number;
  orientation: string;
  trackingCode?: string;
}

interface Package3DVisualizationProps {
  visible: boolean;
  onClose: () => void;
  packages: PackageDetail[];
  vehicleName?: string;
  containerDimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

const Package3DVisualization: React.FC<Package3DVisualizationProps> = ({
  visible,
  onClose,
  packages,
  vehicleName = "Xe tải",
  containerDimensions,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number>();
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);

  const [rotationSpeed, setRotationSpeed] = useState({ x: 0, y: 0.01 });
  const [zoom, setZoom] = useState(1);

  // Calculate container dimensions from packages if not provided
  const getContainerDimensions = () => {
    if (containerDimensions) return containerDimensions;

    const maxX = Math.max(...packages.map((p) => p.x + p.length), 2);
    const maxY = Math.max(...packages.map((p) => p.y + p.width), 2);
    const maxZ = Math.max(...packages.map((p) => p.z + p.height), 2);

    return { length: maxX, width: maxY, height: maxZ };
  };

  useEffect(() => {
    if (!visible || !canvasRef.current || packages.length === 0) return;

    const initScene = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamic import Three.js to reduce bundle size
        const THREE = await import("three");
        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls.js"
        );

        const canvas = canvasRef.current;
        if (!canvas) return;

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f2f5);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(
          75,
          width / height,
          0.1,
          1000
        );
        const containerDims = getContainerDimensions();
        const maxDim = Math.max(
          containerDims.length,
          containerDims.width,
          containerDims.height
        );
        camera.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = maxDim * 0.5;
        controls.maxDistance = maxDim * 3;
        controls.enablePan = true;
        controlsRef.current = controls;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(10, 10, 10);
        directionalLight1.castShadow = true;
        directionalLight1.shadow.mapSize.width = 2048;
        directionalLight1.shadow.mapSize.height = 2048;
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight2.position.set(-10, 5, -10);
        scene.add(directionalLight2);

        // Container (vehicle cargo area)
        const containerGeometry = new THREE.BoxGeometry(
          containerDims.length,
          containerDims.height,
          containerDims.width
        );
        const containerEdges = new THREE.EdgesGeometry(containerGeometry);
        const containerLine = new THREE.LineSegments(
          containerEdges,
          new THREE.LineBasicMaterial({ color: 0x1890ff, linewidth: 2 })
        );
        containerLine.position.set(
          containerDims.length / 2,
          containerDims.height / 2,
          containerDims.width / 2
        );
        scene.add(containerLine);

        // Semi-transparent container walls
        const containerMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x1890ff,
          transparent: true,
          opacity: 0.1,
          side: THREE.DoubleSide,
        });
        const containerMesh = new THREE.Mesh(
          containerGeometry,
          containerMaterial
        );
        containerMesh.position.copy(containerLine.position);
        scene.add(containerMesh);

        // Floor grid
        const gridSize =
          Math.max(containerDims.length, containerDims.width) * 1.5;
        const gridHelper = new THREE.GridHelper(
          gridSize,
          20,
          0xcccccc,
          0xeeeeee
        );
        gridHelper.position.y = 0;
        scene.add(gridHelper);

        // Add packages
        const colors = [
          0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181, 0xaa96da, 0xfcbad3,
          0xa8e6cf, 0xffd3b6, 0xffaaa5,
        ];

        packages.forEach((pkg, index) => {
          const geometry = new THREE.BoxGeometry(
            pkg.length,
            pkg.height,
            pkg.width
          );
          const material = new THREE.MeshPhongMaterial({
            color: colors[index % colors.length],
            transparent: true,
            opacity: 0.85,
            shininess: 100,
          });

          const box = new THREE.Mesh(geometry, material);
          box.position.set(
            pkg.x + pkg.length / 2,
            pkg.z + pkg.height / 2,
            pkg.y + pkg.width / 2
          );
          box.castShadow = true;
          box.receiveShadow = true;

          // Add edges for better visibility
          const edges = new THREE.EdgesGeometry(geometry);
          const edgeLine = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 })
          );
          edgeLine.position.copy(box.position);

          scene.add(box);
          scene.add(edgeLine);

          // Add label
          if (pkg.trackingCode) {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (context) {
              canvas.width = 256;
              canvas.height = 64;
              context.fillStyle = "white";
              context.fillRect(0, 0, canvas.width, canvas.height);
              context.fillStyle = "black";
              context.font = "bold 20px Arial";
              context.textAlign = "center";
              context.fillText(pkg.trackingCode.slice(-8), 128, 40);

              const texture = new THREE.CanvasTexture(canvas);
              const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
              const sprite = new THREE.Sprite(spriteMaterial);
              sprite.position.set(
                box.position.x,
                box.position.y + pkg.height / 2 + 0.2,
                box.position.z
              );
              sprite.scale.set(0.5, 0.125, 1);
              scene.add(sprite);
            }
          }
        });

        // Add axes helper
        const axesHelper = new THREE.AxesHelper(maxDim * 0.5);
        scene.add(axesHelper);

        // Animation loop
        const animate = () => {
          animationFrameRef.current = requestAnimationFrame(animate);

          controls.update();
          renderer.render(scene, camera);
        };

        animate();
        setLoading(false);
      } catch (err) {
        console.error("Error initializing 3D scene:", err);
        setError("Không thể khởi tạo trực quan 3D. Vui lòng thử lại.");
        setLoading(false);
      }
    };

    initScene();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, [visible, packages]);

  const handleReset = () => {
    if (cameraRef.current && controlsRef.current) {
      const containerDims = getContainerDimensions();
      const maxDim = Math.max(
        containerDims.length,
        containerDims.width,
        containerDims.height
      );
      cameraRef.current.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5);
      controlsRef.current.reset();
    }
  };

  const containerDims = getContainerDimensions();
  const totalVolume = packages.reduce(
    (sum, pkg) => sum + pkg.length * pkg.width * pkg.height,
    0
  );
  const containerVolume =
    containerDims.length * containerDims.width * containerDims.height;
  const utilizationRate = ((totalVolume / containerVolume) * 100).toFixed(1);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <EyeOutlined className="text-blue-500" />
          <span>Trực quan hóa 3D - {vehicleName}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={1000}
      style={{ top: 20 }}
    >
      <div className="space-y-4">
        {/* Stats */}
        <Row gutter={16}>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-xs text-gray-500">Số kiện hàng</div>
              <div className="text-lg font-bold text-blue-600">
                {packages.length}
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-xs text-gray-500">Kích thước xe</div>
              <div className="text-sm font-bold text-green-600">
                {containerDims.length.toFixed(1)}m ×{" "}
                {containerDims.width.toFixed(1)}m ×{" "}
                {containerDims.height.toFixed(1)}m
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-xs text-gray-500">Thể tích hàng</div>
              <div className="text-lg font-bold text-orange-600">
                {totalVolume.toFixed(2)}m³
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" className="text-center">
              <div className="text-xs text-gray-500">Tỷ lệ sử dụng</div>
              <div className="text-lg font-bold text-purple-600">
                {utilizationRate}%
              </div>
            </Card>
          </Col>
        </Row>

        {/* Canvas */}
        <div
          className="relative bg-gray-50 rounded-lg border-2 border-gray-200"
          style={{ height: "500px" }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <Spin size="large" tip="Đang tải trực quan 3D..." />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <Alert message="Lỗi" description={error} type="error" showIcon />
            </div>
          )}

          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%", display: "block" }}
          />

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                type="primary"
                ghost
              >
                Đặt lại góc nhìn
              </Button>
            </Space>
          </div>
        </div>

        {/* Instructions */}
        <Alert
          message="Hướng dẫn điều khiển"
          description={
            <div className="text-sm space-y-1">
              <div>
                🖱️ <strong>Chuột trái + Kéo:</strong> Xoay góc nhìn
              </div>
              <div>
                🖱️ <strong>Chuột phải + Kéo:</strong> Di chuyển
              </div>
              <div>
                🖱️ <strong>Lăn chuột:</strong> Phóng to/thu nhỏ
              </div>
            </div>
          }
          type="info"
          showIcon
        />
      </div>
    </Modal>
  );
};

export default Package3DVisualization;
