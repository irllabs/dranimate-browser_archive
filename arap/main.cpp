//
//  main.cpp
//  puppetWork
//
//  Created by bogo on 4/10/16.
//
//

#include <stdio.h>

#include "RigidMeshDeformer2D.h"

rmsmesh::TriangleMesh m_mesh;
float m_bounds[6];
Wml::Vector2f m_vTranslate;
float m_fScale;
rmsmesh::TriangleMesh m_deformedMesh;

rmsmesh::RigidMeshDeformer2D m_deformer;
bool m_bConstraintsValid;

std::set<unsigned int> m_vSelected;
unsigned int m_nSelected;

int m_nViewport[4];

void InitializeDeformedMesh();
void UpdateDeformedMesh();
void InvalidateConstraints();
void ValidateConstraints();
unsigned int FindHitVertex( float nX, float nY );

void MakeSquareMesh()
{
	m_mesh.Clear();

	const unsigned int nRowLen = 5;

	float fYStep = 2.0f / (float)(nRowLen-1);
	float fXStep = 2.0f / (float)(nRowLen-1);

	for ( unsigned int yi = 0; yi < nRowLen; ++yi ) {
		float fY = -1.0f + (float)yi * fYStep;
		for ( unsigned int xi = 0; xi < nRowLen; ++xi ) {
			float fX = -1.0f + (float)xi * fXStep;

			Wml::Vector3f vVert(fX,fY,0);
			m_mesh.AppendVertexData( vVert );
		}
	}

	for ( unsigned int yi = 0; yi < nRowLen-1; ++yi ) {
		unsigned int nRow1 = yi * nRowLen;
		unsigned int nRow2 = (yi+1) * nRowLen;

		for ( unsigned int xi = 0; xi < nRowLen-1; ++xi ) {

			unsigned int nTri1[3] = { nRow1 + xi, nRow2 + xi + 1, nRow1 + xi + 1 };
			unsigned int nTri2[3] = { nRow1 + xi, nRow2 + xi, nRow2 + xi + 1 };

			m_mesh.AppendTriangleData( nTri1 );
			m_mesh.AppendTriangleData( nTri2 );
		}
	}
			
	InitializeDeformedMesh();
}

void InitializeDeformedMesh()
{
	m_deformedMesh.Clear();
	
	unsigned int nVerts = m_mesh.GetNumVertices();
	for ( unsigned int i = 0; i < nVerts; ++i ) {
		Wml::Vector3f vVertex;
		m_mesh.GetVertex(i, vVertex);
		m_deformedMesh.AppendVertexData(vVertex);
	}

	unsigned int nTris = m_mesh.GetNumTriangles();
	for ( unsigned int i = 0; i < nTris; ++i ) {
		unsigned int nTriangle[3];
		m_mesh.GetTriangle(i,nTriangle);
		m_deformedMesh.AppendTriangleData(nTriangle);
	}

	m_deformer.InitializeFromMesh( &m_mesh );
	InvalidateConstraints();
}



void UpdateDeformedMesh() 
{
	ValidateConstraints();
	m_deformer.UpdateDeformedMesh( &m_deformedMesh, true );
}


// deformer stuff
void InvalidateConstraints() 
{ 
	m_bConstraintsValid = false; 
}

void ValidateConstraints()
{
	if ( m_bConstraintsValid )
		return;

	size_t nConstraints = m_vSelected.size();
	std::set<unsigned int>::iterator cur(m_vSelected.begin()), end(m_vSelected.end());
	while ( cur != end ) {
		unsigned int nVertex = *cur++;
		Wml::Vector3f vVertex;
		m_deformedMesh.GetVertex( nVertex, vVertex);
		m_deformer.SetDeformedHandle( nVertex, Wml::Vector2f( vVertex.X(), vVertex.Y() ) );
	}

	m_deformer.ForceValidation();

	m_bConstraintsValid = true;
}

extern "C" {
	/* test c calls */
	void setupMesh(void) {
		std::cout << "setup!\n";
		MakeSquareMesh();
	    std::cout << "setup done!\n";
	}
	
	/* test array access/return arrays */
	int float_multiply_array(float factor, float *arr, int length) {
		for (int i = 0; i <  length; i++) {
			arr[i] = factor * arr[i];
		}
		return 0;
	}

	int resetMesh() {
		m_mesh.Clear();
		return 0;
	}

	int setMeshVertexData(float *arr, int length) {
		for (int i = 0; i <  length; i+=2) {
			Wml::Vector3f vVert(arr[i], arr[i+1], 0);
			m_mesh.AppendVertexData( vVert );
		}
		return 0;
	}

	int setMeshTriangleData(float *arr, int length) {
		for (int i = 0; i <  length; i+=3) {
			unsigned int nTri[3] = { arr[i], arr[i+1], arr[i+2] };
			m_mesh.AppendTriangleData( nTri );
		}
		return 0;
	}

	int setupMesh() {
		m_deformedMesh.Clear();
	
		unsigned int nVerts = m_mesh.GetNumVertices();
		for ( unsigned int i = 0; i < nVerts; ++i ) {
			Wml::Vector3f vVertex;
			m_mesh.GetVertex(i, vVertex);
			m_deformedMesh.AppendVertexData(vVertex);
		}

		unsigned int nTris = m_mesh.GetNumTriangles();
		for ( unsigned int i = 0; i < nTris; ++i ) {
			unsigned int nTriangle[3];
			m_mesh.GetTriangle(i,nTriangle);
			m_deformedMesh.AppendTriangleData(nTriangle);
		}

		m_deformer.InitializeFromMesh( &m_mesh );
		InvalidateConstraints();
	}

	int addControlPoint(int index, float x, float y) {
		m_vSelected.insert(nHit);
		InvalidateConstraints();
		return 0;
	}

	int removeControlPoint(int index) {
		m_vSelected.erase(nHit);
		m_deformer.RemoveHandle(nHit);

		// restore position
		Wml::Vector3f vVertex;
		m_mesh.GetVertex(nHit,vVertex);
		m_deformedMesh.SetVertex(nHit, vVertex);
	}

	int setControlPoint(int index, float x, float y) {
		
		Wml::Vector3f vNewPos( x, y, 0.0f );
		m_deformedMesh.SetVertex( m_nSelected, vNewPos );
		InvalidateConstraints();
	}

	int updateMeshDeformation() {
		UpdateDeformedMesh();
		return 0;
	}

	int getMeshVertexData(float *arr, int length) {
		for(int i = 0; i < length/2; i++) {
			Wml::Vector3f vert;
			m_mesh.GetVertex(i, vert);

			arr[i*2] = vert.X();
			arr[i*2+1] = vert.Y();
		}

		return 0;
	}

}

int main() {
	std::cout << "main method!\n";

    std::cout << "main method done!\n";
}
